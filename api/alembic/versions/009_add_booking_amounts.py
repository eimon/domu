"""add total_amount and paid_amount to bookings

Revision ID: 009
Revises: 008
Create Date: 2026-03-16

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "009"
down_revision: Union[str, None] = "008"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("bookings", sa.Column("total_amount", sa.Numeric(precision=10, scale=2), nullable=True))
    op.add_column("bookings", sa.Column("paid_amount", sa.Numeric(precision=10, scale=2), nullable=True))


def downgrade() -> None:
    op.drop_column("bookings", "paid_amount")
    op.drop_column("bookings", "total_amount")
