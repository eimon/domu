from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.pricing_rule import PricingRule
from schemas.pricing_rule import PricingRuleCreate, PricingRuleUpdate
from datetime import date
import uuid


class PricingRuleRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, property_id: uuid.UUID, rule_create: PricingRuleCreate) -> PricingRule:
        db_rule = PricingRule(
            property_id=property_id,
            name=rule_create.name,
            start_date=rule_create.start_date,
            end_date=rule_create.end_date,
            profitability_percent=rule_create.profitability_percent,
            priority=rule_create.priority
        )
        self.db.add(db_rule)
        await self.db.flush()
        await self.db.refresh(db_rule)
        return db_rule

    async def get_by_id(self, rule_id: uuid.UUID) -> PricingRule | None:
        result = await self.db.execute(select(PricingRule).where(PricingRule.id == rule_id))
        return result.scalars().first()

    async def get_by_property(self, property_id: uuid.UUID) -> list[PricingRule]:
        """Get all rules for a property ordered by priority (desc)."""
        result = await self.db.execute(
            select(PricingRule)
            .where(PricingRule.property_id == property_id)
            .order_by(PricingRule.priority.desc())
        )
        return list(result.scalars().all())

    async def get_active_rules_for_date(self, property_id: uuid.UUID, target_date: date) -> list[PricingRule]:
        """Get rules applicable for a specific date (ordered by priority desc)."""
        result = await self.db.execute(
            select(PricingRule)
            .where(
                PricingRule.property_id == property_id,
                PricingRule.start_date <= target_date,
                PricingRule.end_date >= target_date
            )
            .order_by(PricingRule.priority.desc())
        )
        return list(result.scalars().all())

    async def update(self, rule_id: uuid.UUID, rule_update: PricingRuleUpdate) -> PricingRule | None:
        db_rule = await self.get_by_id(rule_id)
        if not db_rule:
            return None

        update_data = rule_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_rule, key, value)

        await self.db.flush()
        await self.db.refresh(db_rule)
        return db_rule

    async def delete(self, rule_id: uuid.UUID) -> bool:
        db_rule = await self.get_by_id(rule_id)
        if not db_rule:
            return False

        await self.db.delete(db_rule)
        return True
