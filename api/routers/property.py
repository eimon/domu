from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from schemas.property import PropertyCreate, PropertyUpdate, PropertyResponse
from services.property_service import PropertyService
from core.database import get_db
from dependencies.auth import get_current_user, has_role
from models.user import User as Usuario
from core.roles import Role

router = APIRouter(prefix="/properties", tags=["properties"])


@router.post("/", response_model=PropertyResponse, status_code=201)
async def create_property(
    property_in: PropertyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(has_role(Role.ROLE_PROPERTY_CREATE))
):
    """Create a new property. Manager_id is auto-assigned from authenticated user."""
    return await PropertyService(db).create_property(property_in, current_user.id)


@router.get("/", response_model=List[PropertyResponse])
async def list_properties(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """List all properties. Authenticated users only."""
    return await PropertyService(db).list_properties(skip, limit)


@router.get("/my-managed", response_model=List[PropertyResponse])
async def list_my_managed_properties(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """List properties managed by the current user."""
    return await PropertyService(db).list_by_manager(current_user.id)


@router.get("/my-owned", response_model=List[PropertyResponse])
async def list_my_owned_properties(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """List properties owned by the current user."""
    return await PropertyService(db).list_by_owner(current_user.id)


@router.get("/{property_id}", response_model=PropertyResponse)
async def get_property(
    property_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Get property details. Authenticated users only."""
    return await PropertyService(db).get_property(property_id)


@router.put("/{property_id}", response_model=PropertyResponse)
async def update_property(
    property_id: UUID,
    property_update: PropertyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(has_role(Role.ROLE_PROPERTY_UPDATE))
):
    """Update a property. Requires MANAGER or ADMIN role."""
    return await PropertyService(db).update_property(property_id, property_update)


@router.delete("/{property_id}", status_code=204)
async def delete_property(
    property_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(has_role(Role.ROLE_PROPERTY_DELETE))
):
    """Delete a property (soft delete). Requires ADMIN role."""
    await PropertyService(db).delete_property(property_id)
