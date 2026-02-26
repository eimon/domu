from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy import or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from models.property_base_price import PropertyBasePrice
import uuid


class PropertyBasePriceRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ------------------------------------------------------------------ #
    # Helpers                                                              #
    # ------------------------------------------------------------------ #

    @staticmethod
    def _root_id(price: PropertyBasePrice) -> uuid.UUID:
        """Returns the root concept ID for any version of a base price."""
        return price.root_price_id or price.id

    # ------------------------------------------------------------------ #
    # Basic operations                                                     #
    # ------------------------------------------------------------------ #

    async def create(self, property_id: uuid.UUID, value: Decimal) -> PropertyBasePrice:
        """Create the initial base price record (start_date=None, end_date=None)."""
        db_price = PropertyBasePrice(
            property_id=property_id,
            value=value,
            is_active=True,
        )
        self.db.add(db_price)
        await self.db.flush()
        await self.db.refresh(db_price)
        return db_price

    async def get_by_id(self, price_id: uuid.UUID) -> PropertyBasePrice | None:
        result = await self.db.execute(
            select(PropertyBasePrice).where(PropertyBasePrice.id == price_id)
        )
        return result.scalars().first()

    async def get_current(self, property_id: uuid.UUID) -> PropertyBasePrice | None:
        """Returns the currently active version (end_date IS NULL AND is_active=True)."""
        result = await self.db.execute(
            select(PropertyBasePrice).where(
                PropertyBasePrice.property_id == property_id,
                PropertyBasePrice.is_active == True,
                PropertyBasePrice.end_date == None,
            )
        )
        return result.scalars().first()

    # ------------------------------------------------------------------ #
    # Temporal queries                                                     #
    # ------------------------------------------------------------------ #

    async def get_all_versions(self, price_id: uuid.UUID) -> list[PropertyBasePrice]:
        """Returns all versions of the base price concept, ordered chronologically."""
        price = await self.get_by_id(price_id)
        if not price:
            return []

        root_id = self._root_id(price)
        result = await self.db.execute(
            select(PropertyBasePrice)
            .where(
                or_(
                    PropertyBasePrice.id == root_id,
                    PropertyBasePrice.root_price_id == root_id,
                )
            )
            .order_by(PropertyBasePrice.start_date.asc().nulls_first())
        )
        return list(result.scalars().all())

    async def get_at_date(self, property_id: uuid.UUID, ref_date: date) -> PropertyBasePrice | None:
        """Returns the active base price version at the given date."""
        result = await self.db.execute(
            select(PropertyBasePrice).where(
                PropertyBasePrice.property_id == property_id,
                PropertyBasePrice.is_active == True,
                or_(PropertyBasePrice.start_date == None, PropertyBasePrice.start_date <= ref_date),
                or_(PropertyBasePrice.end_date == None, PropertyBasePrice.end_date >= ref_date),
            )
        )
        return result.scalars().first()

    async def get_overlapping(
        self, property_id: uuid.UUID, range_start: date, range_end: date
    ) -> list[PropertyBasePrice]:
        """Returns all base price records overlapping the given date range (for bulk lookups)."""
        result = await self.db.execute(
            select(PropertyBasePrice).where(
                PropertyBasePrice.property_id == property_id,
                PropertyBasePrice.is_active == True,
                or_(PropertyBasePrice.start_date == None, PropertyBasePrice.start_date <= range_end),
                or_(PropertyBasePrice.end_date == None, PropertyBasePrice.end_date >= range_start),
            )
        )
        return list(result.scalars().all())

    # ------------------------------------------------------------------ #
    # Versioning operations                                                #
    # ------------------------------------------------------------------ #

    async def modify_value(
        self,
        current: PropertyBasePrice,
        new_value: Decimal,
        start_date: date,
    ) -> PropertyBasePrice:
        """
        Closes the current version (sets end_date = start_date - 1) and creates
        a new version with the given value and start_date.
        Returns the new version.
        """
        current.end_date = start_date - timedelta(days=1)
        await self.db.flush()

        root_id = self._root_id(current)
        new_version = PropertyBasePrice(
            property_id=current.property_id,
            value=new_value,
            is_active=True,
            start_date=start_date,
            end_date=None,
            root_price_id=root_id,
        )
        self.db.add(new_version)
        await self.db.flush()
        await self.db.refresh(new_version)
        return new_version

    async def revert_last_modification(self, price_id: uuid.UUID) -> PropertyBasePrice | None:
        """
        Undoes the last modification: hard-deletes the current version and
        restores the previous version by clearing its end_date.
        Returns the restored previous version, or None if there is no history.
        """
        versions = await self.get_all_versions(price_id)
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

    async def update_property_cache(self, property_id: uuid.UUID, value: Decimal) -> None:
        """Updates the cached base_price on the properties table."""
        from models.property import Property
        result = await self.db.execute(
            select(Property).where(Property.id == property_id)
        )
        prop = result.scalars().first()
        if prop:
            prop.base_price = value
            await self.db.flush()
