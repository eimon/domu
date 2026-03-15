import uuid
from datetime import date

from sqlalchemy.ext.asyncio import AsyncSession

from core.enums import CostCalculationType
from exceptions.general import BadRequestException, NotFoundException
from models.property_cost import PropertyCost
from repositories.booking_repository import BookingRepository
from repositories.cost_repository import CostRepository
from repositories.property_repository import PropertyRepository
from schemas.property_cost import PropertyCostCreate, PropertyCostFinalize, PropertyCostModify, PropertyCostUpdate


class CostService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.cost_repo = CostRepository(db)
        self.property_repo = PropertyRepository(db)
        self.booking_repo = BookingRepository(db)

    async def create_cost(self, property_id: uuid.UUID, cost_in: PropertyCostCreate) -> PropertyCost:
        """Create a new property cost."""
        prop = await self.property_repo.get_by_id(property_id)
        if not prop:
            raise NotFoundException("Propiedad no encontrada")

        if cost_in.calculation_type == CostCalculationType.PERCENTAGE and cost_in.value > 100:
            raise BadRequestException("El porcentaje no puede ser mayor al 100%")

        return await self.cost_repo.create(property_id, cost_in)

    async def list_costs(self, property_id: uuid.UUID) -> list[PropertyCost]:
        """List current active versions of costs for a property."""
        prop = await self.property_repo.get_by_id(property_id)
        if not prop:
            raise NotFoundException("Propiedad no encontrada")

        return await self.cost_repo.get_by_property(property_id)

    async def update_cost(self, cost_id: uuid.UUID, cost_in: PropertyCostUpdate) -> PropertyCost:
        """Update a property cost in place (for corrections, not versioned)."""
        updated = await self.cost_repo.update(cost_id, cost_in)
        if not updated:
            raise NotFoundException("Costo no encontrado")
        return updated

    async def delete_cost(self, cost_id: uuid.UUID) -> PropertyCost:
        """Soft delete the current version of a cost."""
        deleted = await self.cost_repo.delete(cost_id)
        if not deleted:
            raise NotFoundException("Costo no encontrado")
        return deleted

    async def modify_cost(self, cost_id: uuid.UUID, modify_in: PropertyCostModify) -> PropertyCost:
        """
        Creates a new dated version of a cost value.
        The previous version is closed with end_date = start_date - 1 day.
        """
        current = await self.cost_repo.get_current_version(cost_id)
        if not current:
            raise NotFoundException("Costo no encontrado o ya eliminado")

        # Validate that the new start_date is strictly after the current period's start
        current_start: date | None = current.start_date
        if current_start is not None and modify_in.start_date <= current_start:
            raise BadRequestException(
                "La fecha de inicio debe ser posterior al inicio del período actual"
            )

        if current.calculation_type == CostCalculationType.PERCENTAGE and modify_in.value > 100:
            raise BadRequestException("El porcentaje no puede ser mayor al 100%")

        if await self.booking_repo.exists_paid_booking_after(current.property_id, modify_in.start_date):
            raise BadRequestException(
                "No se puede modificar el costo: el nuevo período incluye fechas de reservas pagadas"
            )

        return await self.cost_repo.modify_cost_value(current, modify_in.value, modify_in.start_date)

    async def revert_cost(self, cost_id: uuid.UUID) -> PropertyCost:
        """
        Undoes the last modification: removes the current version and restores the previous one.
        """
        cost = await self.cost_repo.get_by_id(cost_id)
        if not cost:
            raise NotFoundException("Costo no encontrado")

        restored = await self.cost_repo.revert_last_modification(cost_id)
        if not restored:
            raise BadRequestException("Este costo no tiene modificaciones que revertir")

        return restored

    async def list_all_costs(self, property_id: uuid.UUID) -> list[PropertyCost]:
        """List latest version of all cost concepts including finalized ones."""
        prop = await self.property_repo.get_by_id(property_id)
        if not prop:
            raise NotFoundException("Propiedad no encontrada")

        return await self.cost_repo.get_all_versions_for_property(property_id)

    async def finalize_cost(self, cost_id: uuid.UUID, finalize_in: PropertyCostFinalize) -> PropertyCost:
        """Sets end_date on the current version (last billing date)."""
        current = await self.cost_repo.get_current_version(cost_id)
        if not current:
            raise NotFoundException("Costo no encontrado o ya eliminado")

        if current.start_date and finalize_in.end_date < current.start_date:
            raise BadRequestException(
                "La fecha de finalización no puede ser anterior al inicio del período"
            )

        from datetime import timedelta
        if await self.booking_repo.exists_paid_booking_after(current.property_id, finalize_in.end_date + timedelta(days=1)):
            raise BadRequestException(
                "No se puede finalizar el costo: existen reservas pagadas con fechas posteriores a la fecha de finalización"
            )

        return await self.cost_repo.finalize_cost(current, finalize_in.end_date)

    async def get_cost_history(self, cost_id: uuid.UUID) -> list[PropertyCost]:
        """Returns all historical versions of a cost concept, ordered chronologically."""
        cost = await self.cost_repo.get_by_id(cost_id)
        if not cost:
            raise NotFoundException("Costo no encontrado")

        return await self.cost_repo.get_all_versions(cost_id)
