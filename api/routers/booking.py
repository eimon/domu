from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from schemas.booking import BookingCreate, BookingUpdate, BookingResponse
from services.booking_service import BookingService
from core.database import get_db
from dependencies.auth import get_current_user, has_role
from models.user import User as Usuario
from core.roles import Role

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("/", response_model=BookingResponse, status_code=201)
async def create_booking(
    booking_in: BookingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(has_role(Role.ROLE_BOOKING_CREATE))
):
    """Create a new booking. Requires MANAGER or ADMIN role."""
    return await BookingService(db).create_booking(booking_in)


@router.get("/", response_model=List[BookingResponse])
async def list_bookings(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """List all bookings. Authenticated users only."""
    return await BookingService(db).list_bookings(skip, limit, current_user)


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Get booking details. Authenticated users only."""
    return await BookingService(db).get_booking(booking_id, current_user)


@router.put("/{booking_id}", response_model=BookingResponse)
async def update_booking(
    booking_id: UUID,
    booking_update: BookingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(has_role(Role.ROLE_BOOKING_UPDATE))
):
    """Update a booking. Requires MANAGER or ADMIN role."""
    return await BookingService(db).update_booking(booking_id, booking_update, current_user)


@router.post("/{booking_id}/accept", response_model=BookingResponse)
async def accept_booking(
    booking_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(has_role(Role.ROLE_BOOKING_UPDATE))
):
    """Accept a TENTATIVE booking. Requires MANAGER or ADMIN role."""
    return await BookingService(db).accept_booking(booking_id, current_user)


@router.post("/{booking_id}/cancel", response_model=BookingResponse)
async def cancel_booking(
    booking_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(has_role(Role.ROLE_BOOKING_UPDATE))
):
    """Cancel a booking (set status to CANCELLED). Requires MANAGER or ADMIN role."""
    return await BookingService(db).cancel_booking(booking_id, current_user)


@router.delete("/{booking_id}", status_code=204)
async def delete_booking(
    booking_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(has_role(Role.ROLE_BOOKING_DELETE))
):
    """Permanently delete a CANCELLED booking. Requires MANAGER or ADMIN role."""
    await BookingService(db).delete_booking(booking_id, current_user)


# Property-specific bookings
@router.get("/properties/{property_id}/bookings", response_model=List[BookingResponse])
async def list_property_bookings(
    property_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """List bookings for a specific property. Authenticated users only."""
    return await BookingService(db).list_bookings_by_property(property_id, skip, limit, current_user)
