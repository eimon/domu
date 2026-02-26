from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy import or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from models.property_cost import PropertyCost
from schemas.property_cost import PropertyCostCreate, PropertyCostUpdate
import uuid


class CostRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ------------------------------------------------------------------ #
    # Helpers                                                              #
    # ------------------------------------------------------------------ #

    @staticmethod
    def _root_id(cost: PropertyCost) -> uuid.UUID:
        """Returns the root concept ID for any version of a cost."""
        return cost.root_cost_id or cost.id

    # ------------------------------------------------------------------ #
    # Basic CRUD                                                           #
    # ------------------------------------------------------------------ #

    async def create(self, property_id: uuid.UUID, cost_create: PropertyCostCreate) -> PropertyCost:
        db_cost = PropertyCost(
            property_id=property_id,
            name=cost_create.name,
            category=cost_create.category,
            calculation_type=cost_create.calculation_type,
            value=cost_create.value,
            is_active=cost_create.is_active,
        )
        self.db.add(db_cost)
        await self.db.flush()
        await self.db.refresh(db_cost)
        return db_cost

    async def get_by_id(self, cost_id: uuid.UUID) -> PropertyCost | None:
        result = await self.db.execute(select(PropertyCost).where(PropertyCost.id == cost_id))
        return result.scalars().first()

    async def get_by_property(self, property_id: uuid.UUID) -> list[PropertyCost]:
        """Returns only the current active version for each cost concept."""
        result = await self.db.execute(
            select(PropertyCost).where(
                PropertyCost.property_id == property_id,
                PropertyCost.is_active == True,
                PropertyCost.end_date == None,
            )
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
        """Soft delete: marks the current version as inactive."""
        db_cost = await self.get_by_id(cost_id)
        if not db_cost:
            return None

        db_cost.is_active = False
        await self.db.flush()
        await self.db.refresh(db_cost)
        return db_cost

    # ------------------------------------------------------------------ #
    # Temporal queries                                                     #
    # ------------------------------------------------------------------ #

    async def get_current_version(self, cost_id: uuid.UUID) -> PropertyCost | None:
        """Returns the currently active version (end_date IS NULL) for the cost concept."""
        cost = await self.get_by_id(cost_id)
        if not cost:
            return None

        root_id = self._root_id(cost)
        result = await self.db.execute(
            select(PropertyCost).where(
                or_(PropertyCost.id == root_id, PropertyCost.root_cost_id == root_id),
                PropertyCost.end_date == None,
                PropertyCost.is_active == True,
            )
        )
        return result.scalars().first()

    async def get_all_versions(self, cost_id: uuid.UUID) -> list[PropertyCost]:
        """Returns all versions of the cost concept, ordered chronologically."""
        cost = await self.get_by_id(cost_id)
        if not cost:
            return []

        root_id = self._root_id(cost)
        result = await self.db.execute(
            select(PropertyCost)
            .where(or_(PropertyCost.id == root_id, PropertyCost.root_cost_id == root_id))
            .order_by(PropertyCost.start_date.asc().nulls_first())
        )
        return list(result.scalars().all())

    async def get_costs_at_date(self, property_id: uuid.UUID, ref_date: date) -> list[PropertyCost]:
        """Returns the active cost version for each concept at the given date."""
        result = await self.db.execute(
            select(PropertyCost).where(
                PropertyCost.property_id == property_id,
                PropertyCost.is_active == True,
                or_(PropertyCost.start_date == None, PropertyCost.start_date <= ref_date),
                or_(PropertyCost.end_date == None, PropertyCost.end_date >= ref_date),
            )
        )
        return list(result.scalars().all())

    async def get_costs_overlapping(
        self, property_id: uuid.UUID, range_start: date, range_end: date
    ) -> list[PropertyCost]:
        """Returns all cost records that overlap with the given date range (for bulk lookups)."""
        result = await self.db.execute(
            select(PropertyCost).where(
                PropertyCost.property_id == property_id,
                PropertyCost.is_active == True,
                or_(PropertyCost.start_date == None, PropertyCost.start_date <= range_end),
                or_(PropertyCost.end_date == None, PropertyCost.end_date >= range_start),
            )
        )
        return list(result.scalars().all())

    # ------------------------------------------------------------------ #
    # Versioning operations                                                #
    # ------------------------------------------------------------------ #

    async def modify_cost_value(
        self,
        current: PropertyCost,
        new_value: Decimal,
        start_date: date,
    ) -> PropertyCost:
        """
        Closes the current version (sets end_date = start_date - 1) and creates
        a new version with the given value and start_date.
        Returns the new version.
        """
        current.end_date = start_date - timedelta(days=1)
        await self.db.flush()

        root_id = self._root_id(current)
        new_version = PropertyCost(
            property_id=current.property_id,
            name=current.name,
            category=current.category,
            calculation_type=current.calculation_type,
            value=new_value,
            is_active=True,
            start_date=start_date,
            end_date=None,
            root_cost_id=root_id,
        )
        self.db.add(new_version)
        await self.db.flush()
        await self.db.refresh(new_version)
        return new_version

    async def revert_last_modification(self, cost_id: uuid.UUID) -> PropertyCost | None:
        """
        Undoes the last modification: hard-deletes the current version and
        restores the previous version by clearing its end_date.
        Returns the restored previous version, or None if there is no history.
        """
        versions = await self.get_all_versions(cost_id)
        if len(versions) < 2:
            return None

        # Versions are sorted by start_date ASC NULLS FIRST.
        # The last element is the current (newest) version.
        current = versions[-1]
        previous = versions[-2]

        await self.db.delete(current)
        await self.db.flush()

        previous.end_date = None
        await self.db.flush()
        await self.db.refresh(previous)
        return previous
