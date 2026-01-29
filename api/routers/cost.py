from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from schemas.property_cost import PropertyCostCreate, PropertyCostUpdate, PropertyCostResponse
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
