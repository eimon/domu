"""cost_temporal_versioning

Revision ID: 003
Revises: 002
Create Date: 2026-02-25

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("property_costs", sa.Column("start_date", sa.Date(), nullable=True))
    op.add_column("property_costs", sa.Column("end_date", sa.Date(), nullable=True))
    op.add_column(
        "property_costs",
        sa.Column(
            "root_cost_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("property_costs.id", ondelete="SET NULL"),
            nullable=True,
        ),
    )

    op.create_index(
        "ix_property_costs_root_cost_id",
        "property_costs",
        ["root_cost_id"],
    )
    op.create_index(
        "ix_property_costs_property_id_end_date",
        "property_costs",
        ["property_id", "end_date"],
    )
    op.create_check_constraint(
        "ck_property_costs_end_after_start",
        "property_costs",
        "end_date IS NULL OR start_date IS NULL OR end_date >= start_date",
    )


def downgrade() -> None:
    op.drop_constraint("ck_property_costs_end_after_start", "property_costs", type_="check")
    op.drop_index("ix_property_costs_property_id_end_date", table_name="property_costs")
    op.drop_index("ix_property_costs_root_cost_id", table_name="property_costs")
    op.drop_column("property_costs", "root_cost_id")
    op.drop_column("property_costs", "end_date")
    op.drop_column("property_costs", "start_date")
