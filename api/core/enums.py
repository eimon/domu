import enum


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    OWNER = "owner"


class BookingStatus(str, enum.Enum):
    CONFIRMED = "CONFIRMED"
    TENTATIVE = "TENTATIVE"
    CANCELLED = "CANCELLED"
    PAID = "PAID"


class PaymentMethod(str, enum.Enum):
    CASH = "CASH"
    TRANSFER = "TRANSFER"
    CARD = "CARD"
    OTHER = "OTHER"


class BookingSource(str, enum.Enum):
    AIRBNB = "AIRBNB"
    BOOKING = "BOOKING"
    DOMU = "DOMU"
    MANUAL = "MANUAL"


class DocumentType(str, enum.Enum):
    DU = "DU"  # Documento Único (Argentina - solo números)
    EXTRANJERO = "EXTRANJERO"  # Documento extranjero (alfanumérico)


class CostCategory(str, enum.Enum):
    RECURRING_MONTHLY = "RECURRING_MONTHLY"      # Applies once per month
    PER_DAY_RESERVATION = "PER_DAY_RESERVATION"  # Applies per day of each reservation (e.g. breakfast)
    PER_RESERVATION = "PER_RESERVATION"          # Applies once per reservation (e.g. cleaning)


class CostCalculationType(str, enum.Enum):
    FIXED_AMOUNT = "FIXED_AMOUNT"  # Exact amount
    PERCENTAGE = "PERCENTAGE"      # Percentage of total
