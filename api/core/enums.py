import enum


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    OWNER = "owner"


class BookingStatus(str, enum.Enum):
    CONFIRMED = "CONFIRMED"
    TENTATIVE = "TENTATIVE"
    CANCELLED = "CANCELLED"


class BookingSource(str, enum.Enum):
    AIRBNB = "AIRBNB"
    BOOKING = "BOOKING"
    DOMU = "DOMU"
    MANUAL = "MANUAL"


class DocumentType(str, enum.Enum):
    DU = "DU"  # Documento Único (Argentina - solo números)
    EXTRANJERO = "EXTRANJERO"  # Documento extranjero (alfanumérico)


class CostCategory(str, enum.Enum):
    RECURRING_MONTHLY = "RECURRING_MONTHLY"  # Applies once per month
    RECURRING_DAILY = "RECURRING_DAILY"      # Applies every day
    PER_RESERVATION = "PER_RESERVATION"    # Applies per reservation


class CostCalculationType(str, enum.Enum):
    FIXED_AMOUNT = "FIXED_AMOUNT"  # Exact amount
    PERCENTAGE = "PERCENTAGE"      # Percentage of total
