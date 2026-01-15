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
