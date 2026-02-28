from pydantic import BaseModel, UUID4, Field, field_validator
from datetime import date, datetime
from typing import Optional
from decimal import Decimal


class PricingRuleBase(BaseModel):
    name: str
    start_date: date
    end_date: date
    profitability_percent: Decimal = Field(..., ge=0, description="Percentage adjustment. 0=Floor, 100=Base")

    @field_validator('end_date')
    @classmethod
    def validate_dates(cls, v: date, info) -> date:
        if 'start_date' in info.data and v < info.data['start_date']:
            raise ValueError('end_date must be after start_date')
        return v


class PricingRuleCreate(PricingRuleBase):
    pass


class PricingRuleUpdate(BaseModel):
    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    profitability_percent: Optional[Decimal] = None


class PricingRuleResponse(PricingRuleBase):
    id: UUID4
    property_id: UUID4
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
