import uuid
from sqlalchemy import Column, DateTime, Date, Numeric, Boolean, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database import Base


class PropertyBasePrice(Base):
    __tablename__ = "property_base_prices"
    __table_args__ = (
        CheckConstraint("value > 0", name="ck_property_base_prices_value_positive"),
        CheckConstraint(
            "end_date IS NULL OR start_date IS NULL OR end_date >= start_date",
            name="ck_property_base_prices_end_after_start",
        ),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    property_id = Column(
        UUID(as_uuid=True),
        ForeignKey("properties.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    value = Column(Numeric(10, 2), nullable=False)
    is_active = Column(Boolean, default=True)

    # Temporal versioning
    start_date = Column(Date(), nullable=True)
    end_date = Column(Date(), nullable=True)
    root_price_id = Column(
        UUID(as_uuid=True),
        ForeignKey("property_base_prices.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    property = relationship("Property", back_populates="base_prices")
