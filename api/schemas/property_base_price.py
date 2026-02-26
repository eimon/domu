from pydantic import BaseModel, UUID4, Field
from datetime import datetime, date
from typing import Optional
from decimal import Decimal


class PropertyBasePriceModify(BaseModel):
    value: Decimal = Field(..., gt=0, description="Nuevo precio base bruto por noche.")
    start_date: date = Field(..., description="Fecha a partir de la cual aplica el nuevo valor.")


class PropertyBasePriceResponse(BaseModel):
    id: UUID4
    property_id: UUID4
    value: Decimal
    is_active: bool
    start_date: Optional[date]
    end_date: Optional[date]
    root_price_id: Optional[UUID4]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
