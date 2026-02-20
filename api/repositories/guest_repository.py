from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.guest import Guest
from schemas.guest import GuestCreate, GuestUpdate
import uuid


class GuestRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, guest_create: GuestCreate) -> Guest:
        db_guest = Guest(
            full_name=guest_create.full_name,
            email=guest_create.email,
            phone=guest_create.phone,
            document_type=guest_create.document_type,
            document_number=guest_create.document_number,
        )
        self.db.add(db_guest)
        await self.db.flush()
        await self.db.refresh(db_guest)
        return db_guest

    async def get_by_id(self, guest_id: uuid.UUID) -> Guest | None:
        result = await self.db.execute(select(Guest).where(Guest.id == guest_id))
        return result.scalars().first()

    async def get_by_email(self, email: str) -> Guest | None:
        result = await self.db.execute(select(Guest).where(Guest.email == email))
        return result.scalars().first()

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[Guest]:
        result = await self.db.execute(select(Guest).offset(skip).limit(limit))
        return list(result.scalars().all())

    async def update(self, guest_id: uuid.UUID, guest_update: GuestUpdate) -> Guest | None:
        db_guest = await self.get_by_id(guest_id)
        if not db_guest:
            return None

        update_data = guest_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_guest, key, value)

        await self.db.flush()
        await self.db.refresh(db_guest)
        return db_guest

    async def delete(self, guest_id: uuid.UUID) -> bool:
        db_guest = await self.get_by_id(guest_id)
        if not db_guest:
            return False

        await self.db.delete(db_guest)
        return True
