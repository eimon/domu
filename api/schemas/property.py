from pydantic import BaseModel, UUID4, Field
from datetime import datetime
from typing import Optional


class PropertyBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    address: str = Field(..., min_length=1)
    description: Optional[str] = None


class PropertyCreate(PropertyBase):
    owner_id: Optional[UUID4] = None


class PropertyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    address: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None


class PropertyResponse(PropertyBase):
    id: UUID4
    manager_id: UUID4
    owner_id: Optional[UUID4]
    created_at: datetime
    updated_at: Optional[datetime]
    is_active: bool

    class Config:
        from_attributes = True
