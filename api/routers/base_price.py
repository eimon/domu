from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from schemas.property_base_price import PropertyBasePriceModify, PropertyBasePriceResponse
from services.property_base_price_service import PropertyBasePriceService
from core.database import get_db
from dependencies.auth import get_current_user, has_role
from models.user import User as Usuario
from core.roles import Role

router = APIRouter(tags=["base-price"])


@router.post(
    "/properties/{property_id}/base-price/modify",
    response_model=PropertyBasePriceResponse,
    status_code=201,
)
async def modify_base_price(
    property_id: UUID,
    modify_in: PropertyBasePriceModify,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(has_role(Role.ROLE_PROPERTY_UPDATE)),
):
    """Create a new dated version of the property base price. Requires MANAGER/ADMIN/OWNER role."""
    return await PropertyBasePriceService(db).modify_base_price(property_id, modify_in)


@router.get(
    "/properties/{property_id}/base-price/history",
    response_model=List[PropertyBasePriceResponse],
)
async def get_base_price_history(
    property_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """List all historical versions of the base price, ordered chronologically."""
    return await PropertyBasePriceService(db).get_history(property_id)


@router.post(
    "/properties/{property_id}/base-price/revert",
    response_model=PropertyBasePriceResponse,
)
async def revert_base_price(
    property_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(has_role(Role.ROLE_PROPERTY_UPDATE)),
):
    """Undo the last base price modification, restoring the previous value. Requires MANAGER/ADMIN/OWNER role."""
    return await PropertyBasePriceService(db).revert_base_price(property_id)
