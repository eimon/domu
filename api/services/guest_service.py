from models.guest import Guest
from schemas.guest import GuestCreate, GuestUpdate
from repositories.guest_repository import GuestRepository
from exceptions.general import NotFoundException
from sqlalchemy.ext.asyncio import AsyncSession
import uuid


class GuestService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.guest_repo = GuestRepository(db)

    async def create_guest(self, guest_create: GuestCreate) -> Guest:
        """Create a new guest."""
        return await self.guest_repo.create(guest_create)

    async def get_guest(self, guest_id: uuid.UUID) -> Guest:
        """Get guest by ID."""
        guest = await self.guest_repo.get_by_id(guest_id)
        if not guest:
            raise NotFoundException("Huésped no encontrado")
        return guest

    async def list_guests(self, skip: int = 0, limit: int = 100) -> list[Guest]:
        """List all guests."""
        return await self.guest_repo.get_all(skip, limit)

    async def update_guest(self, guest_id: uuid.UUID, guest_update: GuestUpdate) -> Guest:
        """Update a guest."""
        guest = await self.guest_repo.update(guest_id, guest_update)
        if not guest:
            raise NotFoundException("Huésped no encontrado")
        return guest

    async def delete_guest(self, guest_id: uuid.UUID) -> bool:
        """Delete a guest."""
        deleted = await self.guest_repo.delete(guest_id)
        if not deleted:
            raise NotFoundException("Huésped no encontrado")
        return deleted
