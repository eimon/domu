from pydantic import BaseModel, EmailStr, UUID4, field_validator
from datetime import datetime
from typing import Optional
from core.enums import DocumentType
import re


class GuestBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    document_type: DocumentType
    document_number: str
    
    @field_validator('document_number')
    @classmethod
    def validate_document_number(cls, v: str, info) -> str:
        """Validate and normalize document number."""
        # Get document_type from values if available
        document_type = info.data.get('document_type')
        
        # Normalize: remove spaces and convert to uppercase
        normalized = v.replace(" ", "").upper()
        
        if document_type == DocumentType.DU:
            # DU must be only digits
            if not normalized.isdigit():
                raise ValueError("DU debe contener solo números")
        elif document_type == DocumentType.EXTRANJERO:
            # EXTRANJERO can be alphanumeric
            if not re.match(r'^[A-Z0-9]+$', normalized):
                raise ValueError("Documento extranjero debe contener solo letras y números")
        
        return normalized


class GuestCreate(GuestBase):
    pass


class GuestUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None


class GuestResponse(GuestBase):
    id: UUID4
    created_at: datetime

    class Config:
        from_attributes = True
