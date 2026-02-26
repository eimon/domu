from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, or_
from models.booking import Booking
from models.property import Property as PropertyModel
from schemas.booking import BookingCreate, BookingUpdate
from core.enums import BookingStatus
from datetime import date
import uuid


class BookingRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, booking_create: BookingCreate, ical_uid: str) -> Booking:
        """Create a booking with auto-generated ical_uid."""
        db_booking = Booking(
            ical_uid=ical_uid,
            property_id=booking_create.property_id,
            guest_id=booking_create.guest_id,
            check_in=booking_create.check_in,
            check_out=booking_create.check_out,
            summary=booking_create.summary,
            description=booking_create.description,
            status=booking_create.status,
            source=booking_create.source
        )
        self.db.add(db_booking)
        await self.db.flush()
        await self.db.refresh(db_booking)
        return db_booking

    async def get_by_id(self, booking_id: uuid.UUID) -> Booking | None:
        result = await self.db.execute(select(Booking).where(Booking.id == booking_id))
        return result.scalars().first()

    async def get_by_ical_uid(self, ical_uid: str) -> Booking | None:
        """Get booking by iCal UID (used for sync)."""
        result = await self.db.execute(select(Booking).where(Booking.ical_uid == ical_uid))
        return result.scalars().first()

    async def get_by_property(self, property_id: uuid.UUID, skip: int = 0, limit: int = 100) -> list[Booking]:
        """Get all bookings for a property."""
        result = await self.db.execute(
            select(Booking)
            .where(Booking.property_id == property_id)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[Booking]:
        result = await self.db.execute(select(Booking).offset(skip).limit(limit))
        return list(result.scalars().all())

    async def get_all_by_manager(
        self, manager_id: uuid.UUID, skip: int = 0, limit: int = 100
    ) -> list[Booking]:
        result = await self.db.execute(
            select(Booking)
            .join(PropertyModel, Booking.property_id == PropertyModel.id)
            .where(PropertyModel.manager_id == manager_id)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def check_conflicts(
        self,
        property_id: uuid.UUID,
        check_in: date,
        check_out: date,
        exclude_booking_id: uuid.UUID | None = None
    ) -> list[Booking]:
        """
        Check for booking conflicts on a property.
        Returns list of conflicting bookings.
        
        Conflict occurs when:
        - Dates overlap
        - Status is CONFIRMED or TENTATIVE (not CANCELLED)
        """
        query = select(Booking).where(
            and_(
                Booking.property_id == property_id,
                Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.TENTATIVE]),
                # Date overlap logic: (check_in < existing_check_out AND check_out > existing_check_in)
                or_(
                    and_(
                        Booking.check_in < check_out,
                        Booking.check_out > check_in
                    )
                )
            )
        )
        
        if exclude_booking_id:
            query = query.where(Booking.id != exclude_booking_id)
        
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def update(self, booking_id: uuid.UUID, booking_update: BookingUpdate) -> Booking | None:
        db_booking = await self.get_by_id(booking_id)
        if not db_booking:
            return None

        update_data = booking_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_booking, key, value)

        await self.db.flush()
        await self.db.refresh(db_booking)
        return db_booking

    async def delete(self, booking_id: uuid.UUID) -> Booking | None:
        """Cancel a booking (set status to CANCELLED)."""
        db_booking = await self.get_by_id(booking_id)
        if not db_booking:
            return None

        db_booking.status = BookingStatus.CANCELLED
        await self.db.flush()
        await self.db.refresh(db_booking)
        return db_booking
