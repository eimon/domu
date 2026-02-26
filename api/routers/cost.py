from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from schemas.property_cost import PropertyCostCreate, PropertyCostModify, PropertyCostUpdate, PropertyCostResponse
from services.cost_service import CostService
from core.database import get_db
from dependencies.auth import get_current_user, has_role
from models.user import User as Usuario
from core.roles import Role

# Note: We structure this as /properties/{id}/costs for creation/listing
# but simple operations on cost ID for update/delete? 
# Standard pattern: 
# POST /properties/{id}/costs
# GET /properties/{id}/costs
# PUT /costs/{id}
# DELETE /costs/{id}

router = APIRouter(tags=["costs"])

@router.post("/properties/{property_id}/costs", response_model=PropertyCostResponse, status_code=201)
async def create_cost(
    property_id: UUID,
    cost_in: PropertyCostCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(has_role(Role.ROLE_PROPERTY_UPDATE))
):
    """Add a cost to a property. Requires MANAGER/ADMIN role."""
    return await CostService(db).create_cost(property_id, cost_in)


@router.get("/properties/{property_id}/costs", response_model=List[PropertyCostResponse])
async def list_costs(
    property_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """List all costs for a property."""
    return await CostService(db).list_costs(property_id)


@router.put("/costs/{cost_id}", response_model=PropertyCostResponse)
async def update_cost(
    cost_id: UUID,
    cost_in: PropertyCostUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(has_role(Role.ROLE_PROPERTY_UPDATE))
):
    """Update a cost. Requires MANAGER/ADMIN role."""
    return await CostService(db).update_cost(cost_id, cost_in)


@router.delete("/costs/{cost_id}", status_code=204)
async def delete_cost(
    cost_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(has_role(Role.ROLE_PROPERTY_UPDATE))
):
    """Delete (soft) a cost. Requires MANAGER/ADMIN role."""
    await CostService(db).delete_cost(cost_id)


@router.post("/costs/{cost_id}/modify", response_model=PropertyCostResponse, status_code=201)
async def modify_cost(
    cost_id: UUID,
    modify_in: PropertyCostModify,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(has_role(Role.ROLE_PROPERTY_UPDATE))
):
    """Create a new dated version of a cost value. Requires MANAGER/ADMIN role."""
    return await CostService(db).modify_cost(cost_id, modify_in)


@router.get("/costs/{cost_id}/history", response_model=List[PropertyCostResponse])
async def get_cost_history(
    cost_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """List all historical versions of a cost concept, ordered chronologically."""
    return await CostService(db).get_cost_history(cost_id)


@router.post("/costs/{cost_id}/revert", response_model=PropertyCostResponse)
async def revert_cost(
    cost_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(has_role(Role.ROLE_PROPERTY_UPDATE))
):
    """Undo the last modification of a cost, restoring the previous value. Requires MANAGER/ADMIN role."""
    return await CostService(db).revert_cost(cost_id)
