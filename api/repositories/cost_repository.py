from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.property_cost import PropertyCost
from schemas.property_cost import PropertyCostCreate, PropertyCostUpdate
import uuid


class CostRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, property_id: uuid.UUID, cost_create: PropertyCostCreate) -> PropertyCost:
        db_cost = PropertyCost(
            property_id=property_id,
            name=cost_create.name,
            category=cost_create.category,
            calculation_type=cost_create.calculation_type,
            value=cost_create.value,
            is_active=cost_create.is_active
        )
        self.db.add(db_cost)
        await self.db.flush()
        await self.db.refresh(db_cost)
        return db_cost

    async def get_by_id(self, cost_id: uuid.UUID) -> PropertyCost | None:
        result = await self.db.execute(select(PropertyCost).where(PropertyCost.id == cost_id))
        return result.scalars().first()

    async def get_by_property(self, property_id: uuid.UUID) -> list[PropertyCost]:
        result = await self.db.execute(
            select(PropertyCost)
            .where(PropertyCost.property_id == property_id, PropertyCost.is_active == True)
        )
        return list(result.scalars().all())

    async def update(self, cost_id: uuid.UUID, cost_update: PropertyCostUpdate) -> PropertyCost | None:
        db_cost = await self.get_by_id(cost_id)
        if not db_cost:
            return None

        update_data = cost_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_cost, key, value)

        await self.db.flush()
        await self.db.refresh(db_cost)
        return db_cost

    async def delete(self, cost_id: uuid.UUID) -> PropertyCost | None:
        """Soft delete."""
        db_cost = await self.get_by_id(cost_id)
        if not db_cost:
            return None

        db_cost.is_active = False
        await self.db.flush()
        await self.db.refresh(db_cost)
        return db_cost
