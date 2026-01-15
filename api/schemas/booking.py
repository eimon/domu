from pydantic import BaseModel, UUID4
from datetime import datetime, date
from typing import Optional
from core.enums import BookingStatus, BookingSource


class BookingBase(BaseModel):
    property_id: UUID4
    guest_id: Optional[UUID4] = None
    check_in: date
    check_out: date
    summary: str
    description: Optional[str] = None


class BookingCreate(BookingBase):
    """Create booking. ical_uid will be auto-generated."""
    status: BookingStatus = BookingStatus.CONFIRMED
    source: BookingSource = BookingSource.DOMU


class BookingUpdate(BaseModel):
    guest_id: Optional[UUID4] = None
    check_in: Optional[date] = None
    check_out: Optional[date] = None
    summary: Optional[str] = None
    description: Optional[str] = None
    status: Optional[BookingStatus] = None


class BookingResponse(BookingBase):
    id: UUID4
    ical_uid: str
    status: BookingStatus
    source: BookingSource
    external_id: Optional[str]
    ical_url: Optional[str]
    last_synced_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
