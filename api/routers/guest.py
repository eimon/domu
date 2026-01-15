from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from schemas.guest import GuestCreate, GuestUpdate, GuestResponse
from services.guest_service import GuestService
from core.database import get_db
from dependencies.auth import get_current_user, has_role
from models.user import User as Usuario
from core.roles import Role

router = APIRouter(prefix="/guests", tags=["guests"])


@router.post("/", response_model=GuestResponse, status_code=201)
async def create_guest(
    guest_in: GuestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(has_role(Role.ROLE_GUEST_MANAGE))
):
    """Create a new guest. Requires MANAGER or ADMIN role."""
    return await GuestService(db).create_guest(guest_in)


@router.get("/", response_model=List[GuestResponse])
async def list_guests(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """List all guests. Authenticated users only."""
    return await GuestService(db).list_guests(skip, limit)


@router.get("/{guest_id}", response_model=GuestResponse)
async def get_guest(
    guest_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Get guest details. Authenticated users only."""
    return await GuestService(db).get_guest(guest_id)


@router.put("/{guest_id}", response_model=GuestResponse)
async def update_guest(
    guest_id: UUID,
    guest_update: GuestUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(has_role(Role.ROLE_GUEST_MANAGE))
):
    """Update a guest. Requires MANAGER or ADMIN role."""
    return await GuestService(db).update_guest(guest_id, guest_update)


@router.delete("/{guest_id}", status_code=204)
async def delete_guest(
    guest_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(has_role(Role.ROLE_GUEST_MANAGE))
):
    """Delete a guest. Requires MANAGER or ADMIN role."""
    await GuestService(db).delete_guest(guest_id)
