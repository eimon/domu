import uuid
from sqlalchemy import Column, String, Date, DateTime, ForeignKey, Text, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database import Base
from core.enums import BookingStatus, BookingSource


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # iCal identifier (must be unique and persistent)
    ical_uid = Column(String, unique=True, nullable=False, index=True)
    
    # Foreign keys
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"), nullable=False)
    guest_id = Column(UUID(as_uuid=True), ForeignKey("guests.id"), nullable=True)
    
    # Dates (DATE only, no time component for iCal compatibility)
    check_in = Column(Date, nullable=False)
    check_out = Column(Date, nullable=False)
    
    # iCal fields
    summary = Column(String, nullable=False)  # SUMMARY
    description = Column(Text, nullable=True)  # DESCRIPTION
    status = Column(Enum(BookingStatus), default=BookingStatus.CONFIRMED, nullable=False)
    source = Column(Enum(BookingSource), default=BookingSource.DOMU, nullable=False)
    
    # External sync metadata
    external_id = Column(String, nullable=True)  # ID from Airbnb/Booking
    ical_url = Column(String, nullable=True)  # Source iCal URL
    last_synced_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    property = relationship("Property", back_populates="bookings")
    guest = relationship("Guest", back_populates="bookings")
