from models.property_cost import PropertyCost
from schemas.property_cost import PropertyCostCreate, PropertyCostUpdate
from repositories.cost_repository import CostRepository
from repositories.property_repository import PropertyRepository
from exceptions.general import NotFoundException, BadRequestException
from sqlalchemy.ext.asyncio import AsyncSession
from core.enums import CostCalculationType
import uuid


class CostService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.cost_repo = CostRepository(db)
        self.property_repo = PropertyRepository(db)

    async def create_cost(self, property_id: uuid.UUID, cost_in: PropertyCostCreate) -> PropertyCost:
        """Create a new property cost."""
        # Verify property exists
        prop = await self.property_repo.get_by_id(property_id)
        if not prop:
            raise NotFoundException("Propiedad no encontrada")
            
        # Validate logic (e.g. percentage <= 100)
        if cost_in.calculation_type == CostCalculationType.PERCENTAGE and cost_in.value > 100:
            raise BadRequestException("El porcentaje no puede ser mayor al 100%")

        return await self.cost_repo.create(property_id, cost_in)

    async def list_costs(self, property_id: uuid.UUID) -> list[PropertyCost]:
        """List active costs for a property."""
        # Verify property exists
        prop = await self.property_repo.get_by_id(property_id)
        if not prop:
            raise NotFoundException("Propiedad no encontrada")
            
        return await self.cost_repo.get_by_property(property_id)

    async def update_cost(self, cost_id: uuid.UUID, cost_in: PropertyCostUpdate) -> PropertyCost:
        """Update a property cost."""
        updated = await self.cost_repo.update(cost_id, cost_in)
        if not updated:
            raise NotFoundException("Costo no encontrado")
        return updated

    async def delete_cost(self, cost_id: uuid.UUID) -> PropertyCost:
        """Delete (soft) a property cost."""
        deleted = await self.cost_repo.delete(cost_id)
        if not deleted:
            raise NotFoundException("Costo no encontrado")
        return deleted
