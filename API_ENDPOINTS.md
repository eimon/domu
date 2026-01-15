# API Endpoints - Domu

Base URL: `http://localhost:8000/api/v1`

## Autenticación

Todos los endpoints (excepto login y register) requieren header:
```
Authorization: Bearer {access_token}
```

### POST /auth/register
Registrar nuevo usuario.

**Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "full_name": "string",
  "role": "ADMIN" | "MANAGER" | "OWNER"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "full_name": "string",
  "role": "string",
  "is_active": true,
  "created_at": "datetime"
}
```

---

### POST /auth/login
Iniciar sesión.

**Body (form-data):**
```
username: string
password: string
```

**Response:** `200 OK`
```json
{
  "access_token": "string",
  "token_type": "bearer"
}
```

---

### GET /auth/perfil
Obtener perfil del usuario actual.

**Auth:** Required

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "full_name": "string",
  "role": "string",
  "is_active": true,
  "created_at": "datetime"
}
```

---

## Propiedades

### POST /properties
Crear propiedad.

**Auth:** Required (MANAGER o ADMIN)

**Body:**
```json
{
  "name": "string",
  "address": "string",
  "description": "string (optional)",
  "owner_id": "uuid (optional)"
}
```
> `manager_id` se asigna automáticamente del usuario autenticado

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "string",
  "address": "string",
  "description": "string",
  "manager_id": "uuid",
  "owner_id": "uuid",
  "created_at": "datetime",
  "updated_at": "datetime",
  "is_active": true
}
```

---

### GET /properties
Listar todas las propiedades.

**Auth:** Required

**Query Params:**
- `skip`: int (default: 0)
- `limit`: int (default: 100, max: 100)

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "string",
    "address": "string",
    ...
  }
]
```

---

### GET /properties/my-managed
Listar propiedades gestionadas por el usuario actual.

**Auth:** Required

**Response:** `200 OK` (Array de propiedades)

---

### GET /properties/my-owned
Listar propiedades del usuario actual como dueño.

**Auth:** Required

**Response:** `200 OK` (Array de propiedades)

---

### GET /properties/{property_id}
Obtener detalle de propiedad.

**Auth:** Required

**Response:** `200 OK` (Objeto propiedad)

---

### PUT /properties/{property_id}
Actualizar propiedad.

**Auth:** Required (MANAGER o ADMIN)

**Body:**
```json
{
  "name": "string (optional)",
  "address": "string (optional)",
  "description": "string (optional)",
  "owner_id": "uuid (optional)"
}
```

**Response:** `200 OK` (Objeto propiedad actualizado)

---

### DELETE /properties/{property_id}
Eliminar propiedad (soft delete).

**Auth:** Required (ADMIN)

**Response:** `204 No Content`

---

## Huéspedes

### POST /guests
Crear huésped.

**Auth:** Required (MANAGER o ADMIN)

**Body:**
```json
{
  "full_name": "string",
  "email": "string",
  "phone": "string (optional)",
  "document_type": "DU" | "EXTRANJERO",
  "document_number": "string"
}
```
> `document_number` se normaliza automáticamente (mayúsculas, sin espacios)

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "full_name": "string",
  "email": "string",
  "phone": "string",
  "document_type": "string",
  "document_number": "string",
  "created_at": "datetime"
}
```

---

### GET /guests
Listar todos los huéspedes.

**Auth:** Required

**Query Params:**
- `skip`: int (default: 0)
- `limit`: int (default: 100, max: 100)

**Response:** `200 OK` (Array de huéspedes)

---

### GET /guests/{guest_id}
Obtener detalle de huésped.

**Auth:** Required

**Response:** `200 OK` (Objeto huésped)

---

### PUT /guests/{guest_id}
Actualizar huésped.

**Auth:** Required (MANAGER o ADMIN)

**Body:**
```json
{
  "full_name": "string (optional)",
  "email": "string (optional)",
  "phone": "string (optional)",
  "document_type": "DU" | "EXTRANJERO (optional)",
  "document_number": "string (optional)"
}
```

**Response:** `200 OK` (Objeto huésped actualizado)

---

### DELETE /guests/{guest_id}
Eliminar huésped.

**Auth:** Required (MANAGER o ADMIN)

**Response:** `204 No Content`

---

## Reservas

### POST /bookings
Crear reserva.

**Auth:** Required (MANAGER o ADMIN)

**Body:**
```json
{
  "property_id": "uuid",
  "guest_id": "uuid (optional)",
  "check_in": "YYYY-MM-DD",
  "check_out": "YYYY-MM-DD",
  "summary": "string",
  "description": "string (optional)",
  "status": "CONFIRMED" | "TENTATIVE" | "CANCELLED" (default: CONFIRMED),
  "source": "AIRBNB" | "BOOKING" | "DOMU" | "MANUAL" (default: DOMU)
}
```
> Valida automáticamente conflictos de fechas

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "ical_uid": "string",
  "property_id": "uuid",
  "guest_id": "uuid",
  "check_in": "date",
  "check_out": "date",
  "summary": "string",
  "description": "string",
  "status": "string",
  "source": "string",
  "external_id": "string",
  "ical_url": "string",
  "last_synced_at": "datetime",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

---

### GET /bookings
Listar todas las reservas.

**Auth:** Required

**Query Params:**
- `skip`: int (default: 0)
- `limit`: int (default: 100, max: 100)

**Response:** `200 OK` (Array de reservas)

---

### GET /bookings/{booking_id}
Obtener detalle de reserva.

**Auth:** Required

**Response:** `200 OK` (Objeto reserva)

---

### PUT /bookings/{booking_id}
Actualizar reserva.

**Auth:** Required (MANAGER o ADMIN)

**Body:**
```json
{
  "guest_id": "uuid (optional)",
  "check_in": "YYYY-MM-DD (optional)",
  "check_out": "YYYY-MM-DD (optional)",
  "summary": "string (optional)",
  "description": "string (optional)",
  "status": "CONFIRMED" | "TENTATIVE" | "CANCELLED (optional)"
}
```
> Valida conflictos si se actualizan fechas

**Response:** `200 OK` (Objeto reserva actualizado)

---

### DELETE /bookings/{booking_id}
Cancelar reserva (soft delete).

**Auth:** Required (MANAGER o ADMIN)

**Response:** `204 No Content`

---

### GET /properties/{property_id}/bookings
Listar reservas de una propiedad específica.

**Auth:** Required

**Query Params:**
- `skip`: int (default: 0)
- `limit`: int (default: 100, max: 100)

**Response:** `200 OK` (Array de reservas)

---

## Códigos de Error

- `400` Bad Request - Validación fallida
- `401` Unauthorized - No autenticado o token inválido
- `403` Forbidden - Sin permisos suficientes
- `404` Not Found - Recurso no encontrado
- `409` Conflict - Conflicto (ej: email duplicado, fechas solapadas)
- `422` Unprocessable Entity - Error de validación de datos
- `500` Internal Server Error

---

## Tipos de Documento (DocumentType)

- `DU`: Documento Único (Argentina) - Solo números
- `EXTRANJERO`: Documento extranjero - Alfanumérico

## Estados de Reserva (BookingStatus)

- `CONFIRMED`: Confirmada
- `TENTATIVE`: Tentativa
- `CANCELLED`: Cancelada

## Fuentes de Reserva (BookingSource)

- `AIRBNB`: Importada de Airbnb
- `BOOKING`: Importada de Booking.com
- `DOMU`: Creada en Domu
- `MANUAL`: Creada manualmente

## Roles de Usuario

- `ADMIN`: Acceso completo
- `MANAGER`: Gestión de propiedades, reservas y huéspedes
- `OWNER`: Solo visualización de propiedades
