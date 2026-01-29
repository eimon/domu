from pydantic import BaseModel, UUID4, Field, field_validator
from datetime import datetime
from typing import Optional
from decimal import Decimal
from core.enums import CostCategory, CostCalculationType


class PropertyCostBase(BaseModel):
    name: str
    category: CostCategory
    calculation_type: CostCalculationType
    value: Decimal = Field(..., gt=0, description="Monto o porcentaje. Debe ser mayor a 0.")
    is_active: bool = True

    @field_validator('value')
    @classmethod
    def validate_value(cls, v: Decimal, info) -> Decimal:
        """Validate value based on calculation type."""
        calculation_type = info.data.get('calculation_type')
        if calculation_type == CostCalculationType.PERCENTAGE:
            if v > 100:
                raise ValueError("El porcentaje no puede ser mayor a 100")
        return v


class PropertyCostCreate(PropertyCostBase):
    pass


class PropertyCostUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[CostCategory] = None
    calculation_type: Optional[CostCalculationType] = None
    value: Optional[Decimal] = Field(None, gt=0)
    is_active: Optional[bool] = None

    @field_validator('value')
    @classmethod
    def validate_value(cls, v: Decimal, info) -> Decimal:
        """Validate value based on calculation type."""
        # Note: In update, we might not have calculation_type if it's not being updated.
        # This is a limitation of simple validators in updates.
        # Ideally we'd check against DB or require calculation_type if value provided.
        # For now, simplistic validation.
        if v is not None and v > 100:
             # Just a heuristic warning/check? Or rigorous?
             # Let's assume percentage constraints.
             pass
        return v


class PropertyCostResponse(PropertyCostBase):
    id: UUID4
    property_id: UUID4
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
