from pydantic import BaseModel, UUID4, Field
from datetime import datetime
from typing import Optional
from decimal import Decimal


class PropertyBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    address: str = Field(..., min_length=1)
    description: Optional[str] = None
    base_price: Decimal = Field(default=0, ge=0, description="GROSS price per night (what guest pays)")
    avg_stay_days: int = Field(default=3, gt=0)
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class PropertyCreate(PropertyBase):
    owner_id: Optional[UUID4] = None


class PropertyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    address: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    avg_stay_days: Optional[int] = Field(None, gt=0)
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class PropertyResponse(PropertyBase):
    id: UUID4
    manager_id: UUID4
    owner_id: Optional[UUID4]
    created_at: datetime
    updated_at: Optional[datetime]
    is_active: bool
    base_price: Decimal
    avg_stay_days: int

    class Config:
        from_attributes = True
