import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Integer, Date, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database import Base


class PricingRule(Base):
    __tablename__ = "pricing_rules"
    __table_args__ = (
        CheckConstraint("end_date > start_date", name="ck_pricing_rules_end_after_start"),
        CheckConstraint("profitability_percent >= 0", name="ck_pricing_rules_profitability_non_negative"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True)

    name = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    profitability_percent = Column(Numeric(5, 2), nullable=False)  # 0-100+
    priority = Column(Integer, default=0, nullable=False)  # Higher wins

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    property = relationship("Property", back_populates="pricing_rules")
