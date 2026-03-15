"""rename_recurring_daily_to_per_day_reservation

Revision ID: 006
Revises: 005
Create Date: 2026-03-15

"""

from typing import Sequence, Union

from alembic import op

revision: str = "006"
down_revision: Union[str, None] = "005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE costcategory RENAME VALUE 'RECURRING_DAILY' TO 'PER_DAY_RESERVATION'")


def downgrade() -> None:
    op.execute("ALTER TYPE costcategory RENAME VALUE 'PER_DAY_RESERVATION' TO 'RECURRING_DAILY'")
