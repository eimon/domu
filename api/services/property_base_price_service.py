import uuid
from datetime import date

from sqlalchemy.ext.asyncio import AsyncSession

from exceptions.general import BadRequestException, NotFoundException
from models.property_base_price import PropertyBasePrice
from repositories.property_base_price_repository import PropertyBasePriceRepository
from repositories.property_repository import PropertyRepository
from schemas.property_base_price import PropertyBasePriceModify


class PropertyBasePriceService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = PropertyBasePriceRepository(db)
        self.property_repo = PropertyRepository(db)

    async def _get_property_or_404(self, property_id: uuid.UUID):
        prop = await self.property_repo.get_by_id(property_id)
        if not prop:
            raise NotFoundException("Propiedad no encontrada")
        return prop

    async def modify_base_price(
        self, property_id: uuid.UUID, modify_in: PropertyBasePriceModify
    ) -> PropertyBasePrice:
        """
        Creates a new dated version of a base price.
        The previous version is closed with end_date = start_date - 1 day.
        Also updates the cached base_price on the property.
        """
        await self._get_property_or_404(property_id)

        current = await self.repo.get_current(property_id)
        if not current:
            raise NotFoundException("Precio base no encontrado para esta propiedad")

        # Validate that the new start_date is strictly after the current period's start
        current_start: date | None = current.start_date
        if current_start is not None and modify_in.start_date <= current_start:
            raise BadRequestException(
                "La fecha de inicio debe ser posterior al inicio del período actual"
            )

        new_version = await self.repo.modify_value(current, modify_in.value, modify_in.start_date)

        # Keep cached base_price on the property in sync
        await self.repo.update_property_cache(property_id, modify_in.value)

        return new_version

    async def revert_base_price(self, property_id: uuid.UUID) -> PropertyBasePrice:
        """
        Undoes the last modification: removes the current version and restores the previous one.
        Also updates the cached base_price on the property.
        """
        await self._get_property_or_404(property_id)

        current = await self.repo.get_current(property_id)
        if not current:
            raise NotFoundException("Precio base no encontrado para esta propiedad")

        restored = await self.repo.revert_last_modification(current.id)
        if not restored:
            raise BadRequestException("Este precio base no tiene modificaciones que revertir")

        # Keep cached base_price on the property in sync
        await self.repo.update_property_cache(property_id, restored.value)

        return restored

    async def get_history(self, property_id: uuid.UUID) -> list[PropertyBasePrice]:
        """Returns all historical versions of the base price, ordered chronologically."""
        await self._get_property_or_404(property_id)

        current = await self.repo.get_current(property_id)
        if not current:
            return []

        return await self.repo.get_all_versions(current.id)
