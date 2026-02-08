from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID
from datetime import date

from schemas.pricing_rule import PricingRuleCreate, PricingRuleUpdate, PricingRuleResponse
from services.pricing_service import PricingService
from core.database import get_db
from dependencies.auth import get_current_user, has_role
from models.user import User as Usuario
from core.roles import Role

router = APIRouter(tags=["pricing"])

@router.post("/properties/{property_id}/pricing-rules", response_model=PricingRuleResponse)
async def create_pricing_rule(
    property_id: UUID,
    rule_in: PricingRuleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(has_role(Role.ROLE_PROPERTY_UPDATE))
):
    """Create a new pricing rule."""
    return await PricingService(db).create_rule(property_id, rule_in)

@router.get("/properties/{property_id}/pricing-rules", response_model=List[PricingRuleResponse])
async def list_pricing_rules(
    property_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """List all pricing rules for a property."""
    return await PricingService(db).list_rules_by_property(property_id)

@router.put("/pricing-rules/{rule_id}", response_model=PricingRuleResponse)
async def update_pricing_rule(
    rule_id: UUID,
    rule_in: PricingRuleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(has_role(Role.ROLE_PROPERTY_UPDATE))
):
    """Update a pricing rule."""
    return await PricingService(db).update_rule(rule_id, rule_in)

@router.delete("/pricing-rules/{rule_id}")
async def delete_pricing_rule(
    rule_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(has_role(Role.ROLE_PROPERTY_UPDATE))
):
    """Delete a pricing rule."""
    await PricingService(db).delete_rule(rule_id)
    return {"message": "Regla de precio eliminada correctamente"}

@router.get("/properties/{property_id}/calendar")
async def get_calendar(
    property_id: UUID,
    start_date: date,
    end_date: date,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Get calendar with calculated prices."""
    return await PricingService(db).get_calendar(property_id, start_date, end_date)

@router.get("/properties/{property_id}/financial-summary")
async def get_financial_summary(
    property_id: UUID,
    year: int = Query(..., ge=2020, le=2100),
    month: int = Query(..., ge=1, le=12),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Get monthly financial performance summary."""
    return await PricingService(db).get_financial_summary(property_id, year, month)
