import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Numeric, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database import Base


class Property(Base):
    __tablename__ = "properties"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False, index=True)
    address = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    
    # Pricing Configuration
    base_price = Column(Numeric(10, 2), default=0, nullable=False)  # GROSS price (what guest pays)
    avg_stay_days = Column(Integer, default=3, nullable=False)  # For cost amortization
    
    # Foreign keys
    manager_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    
    # Relationships
    manager = relationship("User", foreign_keys=[manager_id], back_populates="managed_properties")
    owner = relationship("User", foreign_keys=[owner_id], back_populates="owned_properties")
    bookings = relationship("Booking", back_populates="property")
    costs = relationship("PropertyCost", back_populates="property", cascade="all, delete-orphan")
    pricing_rules = relationship("PricingRule", back_populates="property", cascade="all, delete-orphan")
