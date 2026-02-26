from models.property import Property
from models.user import User as UserModel
from schemas.property import PropertyCreate, PropertyUpdate
from repositories.property_repository import PropertyRepository
from repositories.property_base_price_repository import PropertyBasePriceRepository
from exceptions.general import NotFoundException, ForbiddenException
from core.enums import UserRole
from sqlalchemy.ext.asyncio import AsyncSession
import uuid


class PropertyService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.property_repo = PropertyRepository(db)
        self.base_price_repo = PropertyBasePriceRepository(db)

    def _is_admin(self, user: UserModel) -> bool:
        return user.role == UserRole.ADMIN

    async def create_property(self, property_create: PropertyCreate, manager_id: uuid.UUID) -> Property:
        """Create a new property and its initial base price record."""
        prop = await self.property_repo.create(property_create, manager_id)
        if property_create.base_price > 0:
            await self.base_price_repo.create(prop.id, property_create.base_price)
        return prop

    async def get_property(self, property_id: uuid.UUID, current_user: UserModel) -> Property:
        """Get property by ID."""
        property_obj = await self.property_repo.get_by_id(property_id)
        if not property_obj:
            raise NotFoundException("Propiedad no encontrada")
        if not self._is_admin(current_user) and property_obj.manager_id != current_user.id:
            raise ForbiddenException("No tienes permiso para acceder a esta propiedad")
        return property_obj

    async def list_properties(self, skip: int = 0, limit: int = 100, current_user: UserModel = None) -> list[Property]:
        """List properties. ADMIN sees all; others see only their own."""
        if self._is_admin(current_user):
            return await self.property_repo.get_all(skip, limit)
        return await self.property_repo.get_by_manager(current_user.id)

    async def list_by_manager(self, manager_id: uuid.UUID) -> list[Property]:
        """List properties managed by a specific user."""
        return await self.property_repo.get_by_manager(manager_id)

    async def list_by_owner(self, owner_id: uuid.UUID) -> list[Property]:
        """List properties owned by a specific user."""
        return await self.property_repo.get_by_owner(owner_id)

    async def update_property(self, property_id: uuid.UUID, property_update: PropertyUpdate, current_user: UserModel) -> Property:
        """Update a property."""
        property_obj = await self.property_repo.get_by_id(property_id)
        if not property_obj:
            raise NotFoundException("Propiedad no encontrada")
        if not self._is_admin(current_user) and property_obj.manager_id != current_user.id:
            raise ForbiddenException("No tienes permiso para modificar esta propiedad")
        updated = await self.property_repo.update(property_id, property_update)
        return updated

    async def delete_property(self, property_id: uuid.UUID, current_user: UserModel) -> Property:
        """Soft delete a property."""
        property_obj = await self.property_repo.get_by_id(property_id)
        if not property_obj:
            raise NotFoundException("Propiedad no encontrada")
        if not self._is_admin(current_user) and property_obj.manager_id != current_user.id:
            raise ForbiddenException("No tienes permiso para eliminar esta propiedad")
        deleted = await self.property_repo.delete(property_id)
        return deleted
