from models.booking import Booking
from models.user import User as UserModel
from schemas.booking import BookingCreate, BookingUpdate
from repositories.booking_repository import BookingRepository
from repositories.property_repository import PropertyRepository
from exceptions.general import NotFoundException, ConflictException, BadRequestException, ForbiddenException
from core.enums import UserRole
from sqlalchemy.ext.asyncio import AsyncSession
from core.config import settings
import uuid


class BookingService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.booking_repo = BookingRepository(db)
        self.property_repo = PropertyRepository(db)

    def _is_admin(self, user: UserModel) -> bool:
        return user.role == UserRole.ADMIN

    async def _check_booking_access(self, booking: Booking, current_user: UserModel) -> None:
        if self._is_admin(current_user):
            return
        prop = await self.property_repo.get_by_id(booking.property_id)
        if not prop or prop.manager_id != current_user.id:
            raise ForbiddenException("No tienes permiso para acceder a esta reserva")

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

    async def get_booking(self, booking_id: uuid.UUID, current_user: UserModel) -> Booking:
        """Get booking by ID."""
        booking = await self.booking_repo.get_by_id(booking_id)
        if not booking:
            raise NotFoundException("Reserva no encontrada")
        await self._check_booking_access(booking, current_user)
        return booking

    async def list_bookings(self, skip: int = 0, limit: int = 100, current_user: UserModel = None) -> list[Booking]:
        """List bookings. ADMIN sees all; others see only bookings for their properties."""
        if self._is_admin(current_user):
            return await self.booking_repo.get_all(skip, limit)
        return await self.booking_repo.get_all_by_manager(current_user.id, skip, limit)

    async def list_bookings_by_property(
        self, property_id: uuid.UUID, skip: int = 0, limit: int = 100, current_user: UserModel = None
    ) -> list[Booking]:
        """List bookings for a specific property."""
        if not self._is_admin(current_user):
            prop = await self.property_repo.get_by_id(property_id)
            if not prop:
                raise NotFoundException("Propiedad no encontrada")
            if prop.manager_id != current_user.id:
                raise ForbiddenException("No tienes permiso para ver las reservas de esta propiedad")
        return await self.booking_repo.get_by_property(property_id, skip, limit)

    async def update_booking(self, booking_id: uuid.UUID, booking_update: BookingUpdate, current_user: UserModel) -> Booking:
        """Update a booking with conflict validation."""
        # Get existing booking (access check included)
        existing = await self.get_booking(booking_id, current_user)

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

    async def cancel_booking(self, booking_id: uuid.UUID, current_user: UserModel) -> Booking:
        """Cancel a booking (soft delete)."""
        booking = await self.booking_repo.get_by_id(booking_id)
        if not booking:
            raise NotFoundException("Reserva no encontrada")
        await self._check_booking_access(booking, current_user)
        booking = await self.booking_repo.delete(booking_id)
        return booking
