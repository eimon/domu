"""initial_schema

Revision ID: 001
Revises:
Create Date: 2026-02-14

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enums
    userrole = postgresql.ENUM("ADMIN", "MANAGER", "OWNER", name="userrole", create_type=False)
    bookingstatus = postgresql.ENUM("CONFIRMED", "TENTATIVE", "CANCELLED", name="bookingstatus", create_type=False)
    bookingsource = postgresql.ENUM("AIRBNB", "BOOKING", "DOMU", "MANUAL", name="bookingsource", create_type=False)
    documenttype = postgresql.ENUM("DU", "EXTRANJERO", name="documenttype", create_type=False)
    costcategory = postgresql.ENUM("RECURRING_MONTHLY", "RECURRING_DAILY", "PER_RESERVATION", name="costcategory", create_type=False)
    costcalculationtype = postgresql.ENUM("FIXED_AMOUNT", "PERCENTAGE", name="costcalculationtype", create_type=False)

    userrole.create(op.get_bind(), checkfirst=True)
    bookingstatus.create(op.get_bind(), checkfirst=True)
    bookingsource.create(op.get_bind(), checkfirst=True)
    documenttype.create(op.get_bind(), checkfirst=True)
    costcategory.create(op.get_bind(), checkfirst=True)
    costcalculationtype.create(op.get_bind(), checkfirst=True)

    # --- users ---
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("username", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("full_name", sa.String(), nullable=True),
        sa.Column("role", userrole, nullable=False, server_default="MANAGER"),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_id", "users", ["id"])
    op.create_index("ix_users_username", "users", ["username"], unique=True)
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # --- guests ---
    op.create_table(
        "guests",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("full_name", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("phone", sa.String(), nullable=True),
        sa.Column("document_type", documenttype, nullable=False),
        sa.Column("document_number", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_guests_id", "guests", ["id"])
    op.create_index("ix_guests_email", "guests", ["email"])
    op.create_index("ix_guests_document_number", "guests", ["document_number"], unique=True)

    # --- properties ---
    op.create_table(
        "properties",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("address", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("base_price", sa.Numeric(10, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("avg_stay_days", sa.Integer(), nullable=False, server_default=sa.text("3")),
        sa.Column("manager_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("owner_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")),
        sa.CheckConstraint("base_price >= 0", name="ck_properties_base_price_non_negative"),
        sa.CheckConstraint("avg_stay_days > 0", name="ck_properties_avg_stay_days_positive"),
    )
    op.create_index("ix_properties_id", "properties", ["id"])
    op.create_index("ix_properties_name", "properties", ["name"])

    # --- bookings ---
    op.create_table(
        "bookings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("ical_uid", sa.String(), nullable=False),
        sa.Column("property_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("properties.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("guest_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("guests.id", ondelete="SET NULL"), nullable=True),
        sa.Column("check_in", sa.Date(), nullable=False),
        sa.Column("check_out", sa.Date(), nullable=False),
        sa.Column("summary", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", bookingstatus, nullable=False, server_default="CONFIRMED"),
        sa.Column("source", bookingsource, nullable=False, server_default="DOMU"),
        sa.Column("external_id", sa.String(), nullable=True),
        sa.Column("ical_url", sa.String(), nullable=True),
        sa.Column("last_synced_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("check_out > check_in", name="ck_bookings_checkout_after_checkin"),
    )
    op.create_index("ix_bookings_id", "bookings", ["id"])
    op.create_index("ix_bookings_ical_uid", "bookings", ["ical_uid"], unique=True)
    op.create_index("ix_bookings_property_dates", "bookings", ["property_id", "check_in", "check_out"])
    op.create_index("ix_bookings_status", "bookings", ["status"])

    # Exclusion constraint for booking overlap (requires btree_gist)
    op.execute("CREATE EXTENSION IF NOT EXISTS btree_gist")
    op.execute("""
        ALTER TABLE bookings
        ADD CONSTRAINT excl_bookings_no_overlap
        EXCLUDE USING gist (
            property_id WITH =,
            daterange(check_in, check_out) WITH &&
        )
        WHERE (status != 'CANCELLED')
    """)

    # --- pricing_rules ---
    op.create_table(
        "pricing_rules",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("property_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("properties.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("profitability_percent", sa.Numeric(5, 2), nullable=False),
        sa.Column("priority", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("end_date > start_date", name="ck_pricing_rules_end_after_start"),
        sa.CheckConstraint("profitability_percent >= 0", name="ck_pricing_rules_profitability_non_negative"),
    )
    op.create_index("ix_pricing_rules_id", "pricing_rules", ["id"])
    op.create_index("ix_pricing_rules_property_id", "pricing_rules", ["property_id"])

    # --- property_costs ---
    op.create_table(
        "property_costs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("property_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("properties.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("category", costcategory, nullable=False),
        sa.Column("calculation_type", costcalculationtype, nullable=False),
        sa.Column("value", sa.Numeric(10, 2), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("value >= 0", name="ck_property_costs_value_non_negative"),
    )
    op.create_index("ix_property_costs_id", "property_costs", ["id"])
    op.create_index("ix_property_costs_property_id", "property_costs", ["property_id"])


def downgrade() -> None:
    op.drop_table("property_costs")
    op.drop_table("pricing_rules")
    op.execute("ALTER TABLE bookings DROP CONSTRAINT IF EXISTS excl_bookings_no_overlap")
    op.drop_table("bookings")
    op.drop_table("properties")
    op.drop_table("guests")
    op.drop_table("users")

    op.execute("DROP TYPE IF EXISTS costcalculationtype")
    op.execute("DROP TYPE IF EXISTS costcategory")
    op.execute("DROP TYPE IF EXISTS documenttype")
    op.execute("DROP TYPE IF EXISTS bookingsource")
    op.execute("DROP TYPE IF EXISTS bookingstatus")
    op.execute("DROP TYPE IF EXISTS userrole")
