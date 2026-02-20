from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.property import Property
from schemas.property import PropertyCreate, PropertyUpdate
import uuid


class PropertyRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, property_create: PropertyCreate, manager_id: uuid.UUID) -> Property:
        db_property = Property(
            name=property_create.name,
            address=property_create.address,
            description=property_create.description,
            base_price=property_create.base_price,
            avg_stay_days=property_create.avg_stay_days,
            manager_id=manager_id,
            owner_id=property_create.owner_id
        )
        self.db.add(db_property)
        await self.db.flush()  # Flush to get DB-generated values
        await self.db.refresh(db_property)  # Refresh to load defaults
        return db_property

    async def get_by_id(self, property_id: uuid.UUID) -> Property | None:
        result = await self.db.execute(select(Property).where(Property.id == property_id))
        return result.scalars().first()

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[Property]:
        result = await self.db.execute(select(Property).where(Property.is_active == True).offset(skip).limit(limit))
        return list(result.scalars().all())

    async def get_by_manager(self, manager_id: uuid.UUID) -> list[Property]:
        result = await self.db.execute(
            select(Property).where(Property.manager_id == manager_id, Property.is_active == True)
        )
        return list(result.scalars().all())

    async def get_by_owner(self, owner_id: uuid.UUID) -> list[Property]:
        result = await self.db.execute(
            select(Property).where(Property.owner_id == owner_id, Property.is_active == True)
        )
        return list(result.scalars().all())

    async def update(self, property_id: uuid.UUID, property_update: PropertyUpdate) -> Property | None:
        db_property = await self.get_by_id(property_id)
        if not db_property:
            return None

        update_data = property_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_property, key, value)

        await self.db.flush()  # Flush to persist changes
        await self.db.refresh(db_property)  # Refresh to get updated_at
        return db_property

    async def delete(self, property_id: uuid.UUID) -> Property | None:
        db_property = await self.get_by_id(property_id)
        if not db_property:
            return None

        db_property.is_active = False
        return db_property
