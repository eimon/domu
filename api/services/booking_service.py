from models.booking import Booking
from schemas.booking import BookingCreate, BookingUpdate
from repositories.booking_repository import BookingRepository
from exceptions.general import NotFoundException, ConflictException, BadRequestException
from sqlalchemy.ext.asyncio import AsyncSession
from core.config import settings
import uuid


class BookingService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.booking_repo = BookingRepository(db)

    def _generate_ical_uid(self, booking_id: uuid.UUID) -> str:
        """Generate iCal UID in format: {booking_id}@domu.{domain}"""
        # Extract domain from API_V1_STR or use default
        domain = getattr(settings, 'DOMAIN', 'domu.com')
        return f"{booking_id}@{domain}"

    async def create_booking(self, booking_create: BookingCreate) -> Booking:
        """Create a new booking with validation."""
        # Validate dates
        if booking_create.check_in >= booking_create.check_out:
            raise BadRequestException("La fecha de check-in debe ser anterior a la de check-out")

        # Check for conflicts
        conflicts = await self.booking_repo.check_conflicts(
            property_id=booking_create.property_id,
            check_in=booking_create.check_in,
            check_out=booking_create.check_out
        )
        
        if conflicts:
            raise ConflictException(
                f"Conflicto de fechas con {len(conflicts)} reserva(s) existente(s)"
            )

        # Generate iCal UID
        booking_id = uuid.uuid4()
        ical_uid = self._generate_ical_uid(booking_id)

        # Create booking
        booking = await self.booking_repo.create(booking_create, ical_uid)
        return booking

    async def get_booking(self, booking_id: uuid.UUID) -> Booking:
        """Get booking by ID."""
        booking = await self.booking_repo.get_by_id(booking_id)
        if not booking:
            raise NotFoundException("Reserva no encontrada")
        return booking

    async def list_bookings(self, skip: int = 0, limit: int = 100) -> list[Booking]:
        """List all bookings."""
        return await self.booking_repo.get_all(skip, limit)

    async def list_bookings_by_property(
        self, property_id: uuid.UUID, skip: int = 0, limit: int = 100
    ) -> list[Booking]:
        """List bookings for a specific property."""
        return await self.booking_repo.get_by_property(property_id, skip, limit)

    async def update_booking(self, booking_id: uuid.UUID, booking_update: BookingUpdate) -> Booking:
        """Update a booking with conflict validation."""
        # Get existing booking
        existing = await self.get_booking(booking_id)

        # If dates are being updated, check for conflicts
        if booking_update.check_in or booking_update.check_out:
            check_in = booking_update.check_in or existing.check_in
            check_out = booking_update.check_out or existing.check_out

            if check_in >= check_out:
                raise BadRequestException("La fecha de check-in debe ser anterior a la de check-out")

            conflicts = await self.booking_repo.check_conflicts(
                property_id=existing.property_id,
                check_in=check_in,
                check_out=check_out,
                exclude_booking_id=booking_id
            )

            if conflicts:
                raise ConflictException(
                    f"Conflicto de fechas con {len(conflicts)} reserva(s) existente(s)"
                )

        booking = await self.booking_repo.update(booking_id, booking_update)
        if not booking:
            raise NotFoundException("Reserva no encontrada")
        return booking

    async def cancel_booking(self, booking_id: uuid.UUID) -> Booking:
        """Cancel a booking (soft delete)."""
        booking = await self.booking_repo.delete(booking_id)
        if not booking:
            raise NotFoundException("Reserva no encontrada")
        return booking
