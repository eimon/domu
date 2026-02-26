from models.property import Property
from schemas.property import PropertyCreate, PropertyUpdate
from repositories.property_repository import PropertyRepository
from repositories.property_base_price_repository import PropertyBasePriceRepository
from exceptions.general import NotFoundException
from sqlalchemy.ext.asyncio import AsyncSession
import uuid


class PropertyService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.property_repo = PropertyRepository(db)
        self.base_price_repo = PropertyBasePriceRepository(db)

    async def create_property(self, property_create: PropertyCreate, manager_id: uuid.UUID) -> Property:
        """Create a new property and its initial base price record."""
        prop = await self.property_repo.create(property_create, manager_id)
        if property_create.base_price > 0:
            await self.base_price_repo.create(prop.id, property_create.base_price)
        return prop

    async def get_property(self, property_id: uuid.UUID) -> Property:
        """Get property by ID."""
        property_obj = await self.property_repo.get_by_id(property_id)
        if not property_obj:
            raise NotFoundException("Propiedad no encontrada")
        return property_obj

    async def list_properties(self, skip: int = 0, limit: int = 100) -> list[Property]:
        """List all properties with pagination."""
        return await self.property_repo.get_all(skip, limit)

    async def list_by_manager(self, manager_id: uuid.UUID) -> list[Property]:
        """List properties managed by a specific user."""
        return await self.property_repo.get_by_manager(manager_id)

    async def list_by_owner(self, owner_id: uuid.UUID) -> list[Property]:
        """List properties owned by a specific user."""
        return await self.property_repo.get_by_owner(owner_id)

    async def update_property(self, property_id: uuid.UUID, property_update: PropertyUpdate) -> Property:
        """Update a property."""
        property_obj = await self.property_repo.update(property_id, property_update)
        if not property_obj:
            raise NotFoundException("Propiedad no encontrada")
        return property_obj

    async def delete_property(self, property_id: uuid.UUID) -> Property:
        """Soft delete a property."""
        property_obj = await self.property_repo.delete(property_id)
        if not property_obj:
            raise NotFoundException("Propiedad no encontrada")
        return property_obj
