"""base_price_temporal_versioning

Revision ID: 004
Revises: 003
Create Date: 2026-02-25

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "property_base_prices",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "property_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("properties.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("value", sa.Numeric(10, 2), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column(
            "root_price_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("property_base_prices.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("value > 0", name="ck_property_base_prices_value_positive"),
        sa.CheckConstraint(
            "end_date IS NULL OR start_date IS NULL OR end_date >= start_date",
            name="ck_property_base_prices_end_after_start",
        ),
    )

    op.create_index(
        "ix_property_base_prices_id",
        "property_base_prices",
        ["id"],
    )
    op.create_index(
        "ix_property_base_prices_property_id",
        "property_base_prices",
        ["property_id"],
    )
    op.create_index(
        "ix_property_base_prices_property_id_end_date",
        "property_base_prices",
        ["property_id", "end_date"],
    )
    op.create_index(
        "ix_property_base_prices_root_price_id",
        "property_base_prices",
        ["root_price_id"],
    )

    # Data migration: copy existing base_price values to the new table
    op.execute("""
        INSERT INTO property_base_prices (id, property_id, value, is_active, created_at)
        SELECT gen_random_uuid(), id, base_price, true, now()
        FROM properties
        WHERE base_price > 0
    """)


def downgrade() -> None:
    op.drop_index("ix_property_base_prices_root_price_id", table_name="property_base_prices")
    op.drop_index("ix_property_base_prices_property_id_end_date", table_name="property_base_prices")
    op.drop_index("ix_property_base_prices_property_id", table_name="property_base_prices")
    op.drop_index("ix_property_base_prices_id", table_name="property_base_prices")
    op.drop_table("property_base_prices")
