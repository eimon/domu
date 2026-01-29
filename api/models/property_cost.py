import uuid
from sqlalchemy import Column, String, DateTime, Enum, Numeric, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database import Base
from core.enums import CostCategory, CostCalculationType


class PropertyCost(Base):
    __tablename__ = "property_costs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"), nullable=False, index=True)
    
    name = Column(String, nullable=False)
    category = Column(Enum(CostCategory), nullable=False)
    calculation_type = Column(Enum(CostCalculationType), nullable=False)
    value = Column(Numeric(10, 2), nullable=False)  # Supports up to 99,999,999.99
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    property = relationship("Property", back_populates="costs")
