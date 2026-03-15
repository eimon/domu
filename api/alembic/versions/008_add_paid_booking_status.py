"""add_paid_booking_status_and_payment_fields

Revision ID: 008
Revises: 007
Create Date: 2026-03-15

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "008"
down_revision: Union[str, None] = "007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add PAID to bookingstatus enum
    op.execute("ALTER TYPE bookingstatus ADD VALUE IF NOT EXISTS 'PAID'")

    # Create paymentmethod enum
    op.execute("CREATE TYPE paymentmethod AS ENUM ('CASH', 'TRANSFER', 'CARD', 'OTHER')")

    # Add payment columns to bookings
    op.add_column("bookings", sa.Column("paid_at", sa.Date(), nullable=True))
    op.add_column("bookings", sa.Column("payment_method", sa.Enum("CASH", "TRANSFER", "CARD", "OTHER", name="paymentmethod"), nullable=True))


def downgrade() -> None:
    op.drop_column("bookings", "payment_method")
    op.drop_column("bookings", "paid_at")
    op.execute("DROP TYPE paymentmethod")
    # Note: PostgreSQL does not support removing enum values; PAID remains in bookingstatus
