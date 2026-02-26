import calendar
import uuid
from datetime import date, timedelta
from decimal import Decimal
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from core.enums import CostCategory, CostCalculationType
from exceptions.general import BadRequestException, NotFoundException
from models.property_cost import PropertyCost
from repositories.booking_repository import BookingRepository
from repositories.cost_repository import CostRepository
from repositories.pricing_rule_repository import PricingRuleRepository
from repositories.property_base_price_repository import PropertyBasePriceRepository
from repositories.property_repository import PropertyRepository
from schemas.pricing_rule import PricingRuleCreate, PricingRuleUpdate


class PricingService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.pricing_repo = PricingRuleRepository(db)
        self.property_repo = PropertyRepository(db)
        self.cost_repo = CostRepository(db)
        self.base_price_repo = PropertyBasePriceRepository(db)
        self.booking_repo = BookingRepository(db)

    # ------------------------------------------------------------------ #
    # Pricing rules CRUD                                                   #
    # ------------------------------------------------------------------ #

    async def create_rule(self, property_id: uuid.UUID, rule_in: PricingRuleCreate) -> object:
        if rule_in.start_date >= rule_in.end_date:
            raise BadRequestException("Fecha fin debe ser posterior a inicio")

        prop = await self.property_repo.get_by_id(property_id)
        if not prop:
            raise NotFoundException("Propiedad no encontrada")

        if await self.pricing_repo.check_overlap(property_id, rule_in.start_date, rule_in.end_date):
            raise BadRequestException("El período de la regla se solapa con una regla existente")

        return await self.pricing_repo.create(property_id, rule_in)

    async def update_rule(self, rule_id: uuid.UUID, rule_in: PricingRuleUpdate) -> object:
        db_rule = await self.pricing_repo.get_by_id(rule_id)
        if not db_rule:
            raise NotFoundException("Regla de precio no encontrada")

        start_date = rule_in.start_date or db_rule.start_date
        end_date = rule_in.end_date or db_rule.end_date

        if start_date >= end_date:
            raise BadRequestException("Fecha fin debe ser posterior a inicio")

        if await self.pricing_repo.check_overlap(db_rule.property_id, start_date, end_date, exclude_id=rule_id):
            raise BadRequestException("El período de la regla se solapa con una regla existente")

        return await self.pricing_repo.update(rule_id, rule_in)

    async def delete_rule(self, rule_id: uuid.UUID) -> bool:
        if not await self.pricing_repo.delete(rule_id):
            raise NotFoundException("Regla de precio no encontrada")
        return True

    async def list_rules_by_property(self, property_id: uuid.UUID):
        return await self.pricing_repo.get_by_property(property_id)

    # ------------------------------------------------------------------ #
    # Cost calculation helpers                                             #
    # ------------------------------------------------------------------ #

    @staticmethod
    def _costs_for_date(all_costs: list[PropertyCost], ref_date: date) -> list[PropertyCost]:
        """Filters a pre-fetched cost list to only those active on ref_date."""
        return [
            c for c in all_costs
            if (c.start_date is None or c.start_date <= ref_date)
            and (c.end_date is None or c.end_date >= ref_date)
        ]

    @staticmethod
    def _base_price_for_date(records, ref_date: date) -> Optional[Decimal]:
        """Returns the base price value active on ref_date from a pre-fetched list."""
        for r in records:
            if (r.start_date is None or r.start_date <= ref_date) \
                    and (r.end_date is None or r.end_date >= ref_date):
                return r.value
        return None

    def _calculate_floor_price(self, costs: list[PropertyCost], avg_stay: int) -> Decimal:
        """
        Calculate the 'zero profit' floor price per day from a pre-filtered cost list.
        Formula:
          (Monthly Fixed / 30) + (Daily Fixed) + (Per Reservation Fixed / avg_stay)
        Percentage costs are treated as markups applied separately.
        """
        floor = Decimal(0)
        for cost in costs:
            if cost.calculation_type == CostCalculationType.FIXED_AMOUNT:
                if cost.category == CostCategory.RECURRING_MONTHLY:
                    floor += cost.value / Decimal(30)
                elif cost.category == CostCategory.RECURRING_DAILY:
                    floor += cost.value
                elif cost.category == CostCategory.PER_RESERVATION:
                    if avg_stay > 0:
                        floor += cost.value / Decimal(avg_stay)
        return floor

    # ------------------------------------------------------------------ #
    # Calendar                                                             #
    # ------------------------------------------------------------------ #

    async def get_calendar(self, property_id: uuid.UUID, start_date: date, end_date: date):
        prop = await self.property_repo.get_by_id(property_id)
        if not prop:
            raise NotFoundException("Propiedad no encontrada")

        # Fetch all cost versions and base price versions overlapping the calendar range once
        all_costs = await self.cost_repo.get_costs_overlapping(property_id, start_date, end_date)
        all_base_prices = await self.base_price_repo.get_overlapping(property_id, start_date, end_date)

        bookings = await self.booking_repo.check_conflicts(property_id, start_date, end_date)

        result = []
        current = start_date
        while current <= end_date:
            day_costs = self._costs_for_date(all_costs, current)
            floor_price = self._calculate_floor_price(day_costs, prop.avg_stay_days)

            rules = await self.pricing_repo.get_active_rules_for_date(property_id, current)
            active_rule = rules[0] if rules else None
            percent = active_rule.profitability_percent if active_rule else Decimal(100)

            day_base_price = self._base_price_for_date(all_base_prices, current) or prop.base_price
            margin = day_base_price - floor_price
            price = floor_price + (margin * (percent / Decimal(100)))

            status = "AVAILABLE"
            for b in bookings:
                if b.check_in <= current < b.check_out:
                    status = "RESERVED"
                    break

            result.append({
                "date": current,
                "price": round(price, 2),
                "status": status,
                "rule_name": active_rule.name if active_rule else None,
                "floor_price": round(floor_price, 2),
                "profitability_percent": percent,
            })
            current += timedelta(days=1)

        return result

    # ------------------------------------------------------------------ #
    # Financial summary                                                    #
    # ------------------------------------------------------------------ #

    async def get_financial_summary(self, property_id: uuid.UUID, year: int, month: int):
        """Calculate monthly financial performance using temporally accurate cost values."""
        prop = await self.property_repo.get_by_id(property_id)
        if not prop:
            raise NotFoundException("Propiedad no encontrada")

        days_in_month = calendar.monthrange(year, month)[1]
        start_date = date(year, month, 1)
        end_date = date(year, month, days_in_month)

        # Fetch all cost versions and base price versions overlapping the month once
        all_costs = await self.cost_repo.get_costs_overlapping(property_id, start_date, end_date)
        all_base_prices = await self.base_price_repo.get_overlapping(property_id, start_date, end_date)

        bookings = await self.booking_repo.get_by_property(property_id, 0, 1000)
        month_bookings = [
            b for b in bookings
            if b.check_in < end_date and b.check_out > start_date and b.status != "CANCELLED"
        ]

        # Monthly fixed costs: use value at the 1st of the month
        start_of_month_costs = self._costs_for_date(all_costs, start_date)
        total_fixed_monthly = Decimal(0)
        for cost in start_of_month_costs:
            if (
                cost.calculation_type == CostCalculationType.FIXED_AMOUNT
                and cost.category == CostCategory.RECURRING_MONTHLY
            ):
                total_fixed_monthly += cost.value

        total_income = Decimal(0)
        total_fixed_daily = Decimal(0)
        total_variable_per_reservation = Decimal(0)
        total_commission_amount = Decimal(0)
        occupied_days = 0

        for booking in month_bookings:
            booking_start = max(booking.check_in, start_date)
            booking_end = min(booking.check_out, end_date)
            days = (booking_end - booking_start).days

            # Per-reservation and commission costs use value at check-in
            checkin_costs = self._costs_for_date(all_costs, booking.check_in)
            for cost in checkin_costs:
                if (
                    cost.calculation_type == CostCalculationType.FIXED_AMOUNT
                    and cost.category == CostCategory.PER_RESERVATION
                ):
                    total_variable_per_reservation += cost.value

            # Income and daily costs per occupied day
            booking_income = Decimal(0)
            for day_offset in range(days):
                day = booking_start + timedelta(days=day_offset)
                occupied_days += 1

                day_costs = self._costs_for_date(all_costs, day)
                floor_price = self._calculate_floor_price(day_costs, prop.avg_stay_days)

                rules = await self.pricing_repo.get_active_rules_for_date(property_id, day)
                active_rule = rules[0] if rules else None
                percent = active_rule.profitability_percent if active_rule else Decimal(100)

                day_base_price = self._base_price_for_date(all_base_prices, day) or prop.base_price
                price = floor_price + (day_base_price - floor_price) * (percent / Decimal(100))
                booking_income += price

                for cost in day_costs:
                    if (
                        cost.calculation_type == CostCalculationType.FIXED_AMOUNT
                        and cost.category == CostCategory.RECURRING_DAILY
                    ):
                        total_fixed_daily += cost.value

            total_income += booking_income

            # Commissions on this booking's income using check-in rates
            for cost in checkin_costs:
                if cost.calculation_type == CostCalculationType.PERCENTAGE:
                    total_commission_amount += booking_income * (cost.value / Decimal(100))

        total_costs = (
            total_fixed_monthly
            + total_fixed_daily
            + total_variable_per_reservation
            + total_commission_amount
        )

        net_profit = total_income - total_costs
        occupancy_rate = (occupied_days / days_in_month) * 100 if days_in_month > 0 else 0

        return {
            "year": year,
            "month": month,
            "days_in_month": days_in_month,
            "occupied_days": occupied_days,
            "occupancy_rate": round(occupancy_rate, 2),
            "total_bookings": len(month_bookings),
            "total_income": round(total_income, 2),
            "costs": {
                "fixed_monthly": round(total_fixed_monthly, 2),
                "fixed_daily": round(total_fixed_daily, 2),
                "variable_per_reservation": round(total_variable_per_reservation, 2),
                "commissions": round(total_commission_amount, 2),
                "total": round(total_costs, 2),
            },
            "net_profit": round(net_profit, 2),
            "profit_margin_percent": round(
                (net_profit / total_income * 100) if total_income > 0 else 0, 2
            ),
        }
