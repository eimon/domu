"""remove_priority_from_pricing_rules

Revision ID: 005
Revises: 004
Create Date: 2026-02-28
"""
from alembic import op
import sqlalchemy as sa

revision = '005'
down_revision = '004'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_column('pricing_rules', 'priority')


def downgrade() -> None:
    op.add_column('pricing_rules',
        sa.Column('priority', sa.Integer(), nullable=False, server_default=sa.text('0')))
