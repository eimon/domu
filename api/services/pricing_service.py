from schemas.pricing_rule import PricingRuleCreate, PricingRuleUpdate
from models.property import Property
from models.property_cost import PropertyCost
from repositories.pricing_rule_repository import PricingRuleRepository
from repositories.property_repository import PropertyRepository
from repositories.cost_repository import CostRepository
from repositories.booking_repository import BookingRepository
from exceptions.general import NotFoundException, BadRequestException
from sqlalchemy.ext.asyncio import AsyncSession
from core.enums import CostCategory, CostCalculationType
from datetime import date, timedelta
from decimal import Decimal
from typing import Optional
import uuid
import calendar


class PricingService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.pricing_repo = PricingRuleRepository(db)
        self.property_repo = PropertyRepository(db)
        self.cost_repo = CostRepository(db)
        self.booking_repo = BookingRepository(db)

    async def create_rule(self, property_id: uuid.UUID, rule_in: PricingRuleCreate) -> object:
        # Check defaults
        if rule_in.start_date >= rule_in.end_date:
            raise BadRequestException("Fecha fin debe ser posterior a inicio")
            
        prop = await self.property_repo.get_by_id(property_id)
        if not prop:
            raise NotFoundException("Propiedad no encontrada")
            
        return await self.pricing_repo.create(property_id, rule_in)

    async def list_rules_by_property(self, property_id: uuid.UUID):
        return await self.pricing_repo.get_by_property(property_id)

    async def _calculate_floor_price(self, property_id: uuid.UUID, costs: list[PropertyCost], avg_stay: int) -> Decimal:
        """
        Calculate the 'zero profit' floor price per day.
        Formula:
          (Monthly Fixed / 30) +
          (Daily Fixed) +
          (Per Reservation Fixed / avg_stay)
        Note: Percentage costs (commissions) are treated as markups later, not part of base floor sum.
        """
        floor = Decimal(0)
        
        for cost in costs:
            if not cost.is_active:
                continue

            # Only process FIXED amounts here. Percentages apply to final price.
            if cost.calculation_type == CostCalculationType.FIXED_AMOUNT:
                if cost.category == CostCategory.RECURRING_MONTHLY:
                    floor += cost.value / Decimal(30)
                elif cost.category == CostCategory.RECURRING_DAILY:
                    floor += cost.value
                elif cost.category == CostCategory.PER_RESERVATION:
                    if avg_stay > 0:
                        floor += cost.value / Decimal(avg_stay)
                        
        return floor

    async def _apply_commissions(self, price: Decimal, costs: list[PropertyCost]) -> Decimal:
        """Apply percentage commissions to price (Gross Up)."""
        # Formula: Base / (1 - Sum(Commission%))
        # Example: Price $100, Comm 10% -> Need to charge $111.11 to net $100.
        
        total_commission_percent = Decimal(0)
        for cost in costs:
            if cost.is_active and cost.calculation_type == CostCalculationType.PERCENTAGE:
                # Assuming value 10 means 10%
                total_commission_percent += cost.value
        
        if total_commission_percent >= 100:
            # Avoid division by zero or negative
            return price
            
        factor = Decimal(1) - (total_commission_percent / Decimal(100))
        return price / factor

    async def get_calendar(self, property_id: uuid.UUID, start_date: date, end_date: date):
        prop = await self.property_repo.get_by_id(property_id)
        if not prop:
            raise NotFoundException("Propiedad no encontrada")

        costs = await self.cost_repo.get_by_property(property_id)
        bookings = await self.booking_repo.check_conflicts(property_id, start_date, end_date) # Needs adjustment to get all
        
        # We need a method to get bookings in range without raising conflicts
        # Using check_conflicts strictly returns conflicting bookings which is what we want for status.
        
        floor_price = await self._calculate_floor_price(property_id, costs, prop.avg_stay_days)
        base_price = prop.base_price
        
        # Pre-fetch rules in range could be optimized, but simpler to fetch all active for date
        # Creating a map of date -> price
        calendar = []
        current = start_date
        while current <= end_date:
            # Find applicable rule
            rules = await self.pricing_repo.get_active_rules_for_date(property_id, current)
            active_rule = rules[0] if rules else None
            
            # Determine profitability %
            # If no rule, profitability is 100% (Base Price) - Implicit logic?
            # User requirement: "Profitability 100% is base price, 0% is costs"
            
            percent = active_rule.profitability_percent if active_rule else Decimal(100)
            
            # Formula: Price = Floor + (Base - Floor) * (Percent / 100)
            # Base Price is the GROSS price (what guest pays)
            # Commissions are deducted from this, not added
            margin = base_price - floor_price
            price = floor_price + (margin * (percent / Decimal(100)))
            
            # Note: Commissions are NOT added to price (Opción A)
            # They are calculated as costs in financial_summary
            
            # Check availability
            # Naive check O(N*M) - optimize later
            status = "AVAILABLE"
            for b in bookings:
                if b.check_in <= current < b.check_out:
                    status = "RESERVED"
                    break
            
            calendar.append({
                "date": current,
                "price": round(price, 2),
                "status": status,
                "rule_name": active_rule.name if active_rule else None,
                "floor_price": round(floor_price, 2),
                "profitability_percent": percent
            })
            current += timedelta(days=1)
            
        return calendar

    async def get_financial_summary(self, property_id: uuid.UUID, year: int, month: int):
        """Calculate real monthly financial performance."""
        prop = await self.property_repo.get_by_id(property_id)
        if not prop:
            raise NotFoundException("Propiedad no encontrada")

        # Get month date range
        days_in_month = calendar.monthrange(year, month)[1]
        start_date = date(year, month, 1)
        end_date = date(year, month, days_in_month)

        # Get all bookings in this month
        bookings = await self.booking_repo.get_by_property(property_id, 0, 1000)
        # Filter bookings that overlap with this month
        month_bookings = [
            b for b in bookings
            if b.check_in < end_date and b.check_out > start_date
            and b.status != "CANCELLED"
        ]

        # Calculate days occupied
        occupied_days = 0
        total_income = Decimal(0)
        
        for booking in month_bookings:
            # Calculate overlap days
            booking_start = max(booking.check_in, start_date)
            booking_end = min(booking.check_out, end_date)
            days = (booking_end - booking_start).days
            occupied_days += days
            
            # Calculate income for these days (we need price info - simplified)
            # In real scenario, you'd store the actual price charged in Booking model
            # For now, using current pricing as estimate
            for day_offset in range(days):
                day = booking_start + timedelta(days=day_offset)
                # Get price for this day (simplified - should cache rules)
                rules = await self.pricing_repo.get_active_rules_for_date(property_id, day)
                active_rule = rules[0] if rules else None
                percent = active_rule.profitability_percent if active_rule else Decimal(100)
                
                costs = await self.cost_repo.get_by_property(property_id)
                floor_price = await self._calculate_floor_price(property_id, costs, prop.avg_stay_days)
                margin = prop.base_price - floor_price
                price = floor_price + (margin * (percent / Decimal(100)))
                
                # Base price is gross (no commission gross-up)
                total_income += price

        # Calculate costs
        costs = await self.cost_repo.get_by_property(property_id)
        
        total_fixed_monthly = Decimal(0)
        total_fixed_daily = Decimal(0)
        total_variable_per_reservation = Decimal(0)
        total_commission_amount = Decimal(0)
        
        for cost in costs:
            if not cost.is_active:
                continue
                
            if cost.calculation_type == CostCalculationType.FIXED_AMOUNT:
                if cost.category == CostCategory.RECURRING_MONTHLY:
                    # Full monthly cost regardless of occupancy
                    total_fixed_monthly += cost.value
                elif cost.category == CostCategory.RECURRING_DAILY:
                    # Only for occupied days
                    total_fixed_daily += cost.value * occupied_days
                elif cost.category == CostCategory.PER_RESERVATION:
                    # Cost per booking
                    total_variable_per_reservation += cost.value * len(month_bookings)
            elif cost.calculation_type == CostCalculationType.PERCENTAGE:
                # Commission on revenue
                commission = total_income * (cost.value / Decimal(100))
                total_commission_amount += commission

        total_costs = (
            total_fixed_monthly +
            total_fixed_daily +
            total_variable_per_reservation +
            total_commission_amount
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
                "total": round(total_costs, 2)
            },
            "net_profit": round(net_profit, 2),
            "profit_margin_percent": round((net_profit / total_income * 100) if total_income > 0 else 0, 2)
        }
