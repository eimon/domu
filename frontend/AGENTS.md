# Domu Frontend — Agent Guide

Este archivo es la referencia completa para agentes de código (Claude, Cursor, etc.) trabajando dentro de `frontend/`. Contiene las convenciones de código, arquitectura, features implementadas y guía de desarrollo.

Complementa el `CLAUDE.md` raíz del proyecto.

## Stack Tecnológico

- **Framework:** Next.js 16 (App Router)
- **Lenguaje:** TypeScript (Strict Mode)
- **Estilos:** Tailwind CSS v4
- **Internacionalización:** `next-intl` (locales: `en`, `es`, default: `en`)
- **Autenticación:** JWT con `jose` (validado en Middleware)
- **Validación:** Zod
- **HTTP (client-side):** axios (`src/lib/api.ts`)
- **HTTP (server-side):** fetch nativo vía `serverApi` (`src/lib/server-api.ts`)
- **Iconos:** `lucide-react`

## Estructura de Directorios

```
frontend/src/
├── app/
│   └── [locale]/
│       ├── (auth)/auth/login/page.tsx     # Página pública de login
│       └── (dashboard)/                   # Rutas protegidas
│           ├── layout.tsx                 # Layout con Sidebar + Navbar
│           ├── page.tsx                   # Dashboard principal
│           ├── properties/
│           │   ├── page.tsx               # Listado de propiedades
│           │   ├── new/page.tsx           # Crear propiedad
│           │   └── [id]/page.tsx          # Detalle tabulado de propiedad
│           ├── bookings/page.tsx
│           ├── guests/page.tsx
│           └── users/page.tsx
├── actions/                               # Server Actions (lógica CRUD)
│   ├── auth.ts
│   ├── base_price.ts
│   ├── bookings.ts
│   ├── calendar.ts
│   ├── costs.ts
│   ├── guests.ts
│   ├── pricing.ts
│   ├── properties.ts
│   └── reports.ts
├── components/                            # Componentes reutilizables (Client)
├── context/                               # ToastContext, ConfirmContext, SidebarContext
├── i18n/
│   ├── routing.ts                         # Definición de locales y navegación
│   └── request.ts                         # Config de next-intl para RSC
├── lib/
│   ├── api.ts                             # axios client (browser, token en localStorage)
│   ├── server-api.ts                      # fetch helper (server, token en cookie)
│   └── utils.ts                           # cn(), formatPrice(), date helpers
├── middleware.ts                           # JWT guard + i18n redirect
└── types/
    └── api.ts                             # Interfaces y Enums del dominio
```

## Convenciones de Código

### Server Actions (`src/actions/`)

Todos los archivos de actions deben comenzar con `"use server"`. Son el lugar donde vive la lógica de negocio del frontend: llamadas a la API, validación con Zod, y revalidación del caché.

```typescript
"use server";

import { z } from "zod";
import { serverApi } from "@/lib/server-api";
import { revalidatePath } from "next/cache";

const domainSchema = z.object({
    name: z.string().min(1, "Name is required"),
});

export type DomainFormState = {
    error?: string;
    success?: boolean;
};

// Para useActionState — recibe (prevState, formData)
export async function createDomain(
    prevState: DomainFormState,
    formData: FormData
): Promise<DomainFormState> {
    const validatedFields = domainSchema.safeParse({
        name: formData.get("name"),
    });

    if (!validatedFields.success) {
        return { error: "Invalid fields" };
    }

    try {
        const res = await serverApi("/domain-endpoint", {
            method: "POST",
            body: JSON.stringify(validatedFields.data),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return { error: errorData.detail || "Failed to create" };
        }
    } catch {
        return { error: "Something went wrong" };
    }

    revalidatePath("/domain-path");
    return { success: true };
}

// Actions de solo lectura (no usan prevState)
export async function getDomains(): Promise<Domain[]> {
    try {
        const res = await serverApi("/domain-endpoint");
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}
```

**Reglas de actions:**
- Siempre `"use server"` al inicio
- Validar con Zod antes de llamar a la API
- Usar `serverApi` (nunca axios) — lee el token desde la cookie `access_token`
- Tras mutaciones: llamar `revalidatePath()` con las rutas afectadas
- Devolver `{ error: string }` o `{ success: true }`, nunca lanzar excepciones al cliente

### Helpers de API

**`serverApi` (server-side):** Para Server Components y Server Actions. Lee el token de la cookie `access_token`.

```typescript
// GET con params
const res = await serverApi("/properties", { params: { skip: "0", limit: "100" } });

// POST
const res = await serverApi("/properties", {
    method: "POST",
    body: JSON.stringify(data),
});

// PUT / DELETE
const res = await serverApi(`/properties/${id}`, { method: "DELETE" });
```

**`api` axios (client-side):** Solo para Client Components que necesiten interacción en tiempo real. Lee el token de `localStorage`.

```typescript
import api from "@/lib/api";
const { data } = await api.get("/some-endpoint");
```

### Tipos (`src/types/api.ts`)

Todos los tipos del dominio viven en un único archivo. Seguir el patrón existente:
- Interfaces con `id: string` (UUID como string)
- Fechas como `string` en formato `YYYY-MM-DD` o ISO datetime
- Valores monetarios como `number`
- Enums TypeScript que replican los enums del backend

Agregar nuevos tipos al final del archivo. No crear archivos de tipos por dominio.

### Componentes (`src/components/`)

Los componentes de `src/components/` son Client Components (implícito o con `"use client"`).

```typescript
"use client";

import { useActionState } from "react";
import { createDomain, type DomainFormState } from "@/actions/domain";

const initialState: DomainFormState = {};

export function DomainForm() {
    const [state, formAction, isPending] = useActionState(createDomain, initialState);

    return (
        <form action={formAction}>
            {state.error && <p className="text-red-500 text-sm">{state.error}</p>}
            <input name="name" required />
            <button type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : "Guardar"}
            </button>
        </form>
    );
}
```

**Convenciones de componentes:**
- Usar `useActionState` para forms conectados a Server Actions
- `isPending` para deshabilitar botones y mostrar loading state
- Iconos: `lucide-react`
- Clases: Tailwind CSS v4, usar `clsx` + `tailwind-merge` (`src/lib/utils.ts`) para condicionales
- Diálogos modales: patrón con `isOpen` / `onClose` props

### Páginas (Server Components)

Las páginas en `app/[locale]/` son Server Components por defecto. Obtienen datos directamente con `serverApi` o llaman a actions de solo lectura.

```typescript
import { getMyProperties } from "@/actions/properties";

export default async function PropertiesPage() {
    const properties = await getMyProperties();
    return <PropertiesGrid properties={properties} />;
}
```

**Estado de UI persistente:** Usar URL Search Params para tabs, filtros y selecciones. Evitar estado local en el servidor.

### Internacionalización (i18n)

- Textos de UI: usar `useTranslations` en Client Components, `getTranslations` en Server Components
- Navegación: importar `Link`, `redirect`, `useRouter` desde `@/i18n/routing` (NO desde `next/navigation`)
- Archivos de mensajes: `messages/en.json` y `messages/es.json`

```typescript
// Server Component
import { getTranslations } from "next-intl/server";
const t = await getTranslations("Properties");

// Client Component
import { useTranslations } from "next-intl";
const t = useTranslations("Properties");
```

### Middleware (`src/middleware.ts`)

- Valida el JWT (cookie `access_token`) con `jose`
- Rutas públicas: `/auth/**` (con cualquier prefijo de locale)
- Rutas protegidas: todo lo demás → redirige a `/{locale}/auth/login` si no hay token o es inválido
- Variable de entorno requerida: `JWT_SECRET_KEY`

## Design System — "Obsidian Glass"

Sistema de diseño oscuro con glassmorphism. Documentado en `DESIGN_SYSTEM.md` y aplicado en `globals.css`.

**Clases glass:** `.glass`, `.glass-elevated`, `.glass-modal`, `.glass-sidebar`

**Tokens de color:**
| Token | Valor | Uso |
|---|---|---|
| `domu-primary` | `#818cf8` | Acciones principales, links activos |
| `domu-success` | `#34d399` | Estados positivos, confirmación |
| `domu-warning` | `#fbbf24` | Advertencias |
| `domu-danger` | `#f87171` | Errores, eliminación |
| `domu-base` | `#0f1117` | Fondo base |

Todos los modales y diálogos usan `glass-modal rounded-2xl shadow-2xl`.

## Sistema Global de UI

- **Toast notifications**: `ToastContext` — `showError(msg)` / `showSuccess(msg)` vía `useToast()`.
- **Diálogos de confirmación**: `ConfirmContext` — `await confirm(mensaje)` devuelve `boolean` vía `useConfirm()`.

Ambos contextos están registrados en el layout raíz y disponibles en cualquier Client Component.

## Autenticación

- **Login:** Server Action `login()` en `actions/auth.ts` — obtiene el token del backend y lo guarda en cookie `httpOnly`
- **Logout:** Server Action `logout()` — borra la cookie y redirige a login
- **Refresco:** Automático sin duplicar peticiones concurrentes
- **Token:** Cookie `access_token` (server) / `localStorage` `access_token` (client, para axios)
- **Variables de entorno:** `NEXT_PUBLIC_API_URL` (default: `http://localhost:8000/api/v1`), `JWT_SECRET_KEY`

## Enums del Dominio

Definidos en `src/types/api.ts`, espejo de los enums del backend:

| Enum | Valores |
|---|---|
| `BookingStatus` | `CONFIRMED`, `TENTATIVE`, `CANCELLED`, `PAID` |
| `BookingSource` | `AIRBNB`, `BOOKING`, `DOMU`, `MANUAL` |
| `DocumentType` | `DU`, `EXTRANJERO` |
| `UserRole` | `ADMIN`, `MANAGER`, `OWNER` |
| `CostCategory` | `RECURRING_MONTHLY`, `PER_DAY_RESERVATION`, `PER_RESERVATION` |
| `CostCalculationType` | `FIXED_AMOUNT`, `PERCENTAGE` |

## Features Implementadas

### Dashboard (Home)

- KPIs del mes: total de propiedades, ingresos, ganancia neta y ocupación promedio.
- Resumen por propiedad: ocupación, ingresos y ganancia del mes actual.
- Próximos check-ins: reservas en los próximos 7 días (no canceladas).

### Gestión de Propiedades

- CRUD completo con validaciones de negocio.
- Autocompletado de dirección con Nominatim (OpenStreetMap) + miniatura de mapa.
- Detalle tabulado: **Detalles y Costos** / **Calendario** / **Reportes**.

### Costos y Precios

- Categorías: `RECURRING_MONTHLY`, `PER_DAY_RESERVATION`, `PER_RESERVATION`; tipo `FIXED_AMOUNT` o `PERCENTAGE`.
- **Versionado temporal** de costos y `base_price`: historial con `start_date`/`end_date`.
  - `ModifyCostDialog` — modifica valor con fecha de vigencia
  - `PriceHistoryDialog` — historial de versiones
  - `FinalizeCostDialog` — cierra la versión activa con `end_date`
  - Revertir al valor anterior
- `BasePriceCard` — gestión del precio base con el mismo patrón de versionado.
- Reglas de precio: períodos con rentabilidad % personalizada, visibles en el calendario.
- `CostsTable`: vista de tabla en desktop, tarjetas en mobile con menú de acciones.

### Calendario Interactivo

- Vista mensual con disponibilidad y precios calculados por día.
- Refleja reglas de precio activas y costos vigentes en cada fecha.

### Reservas y Pagos

- Estados: `TENTATIVE`, `CONFIRMED`, `CANCELLED`, `PAID`.
- Acciones: confirmar, cancelar, eliminar según estado.
- `BookingDetailModal`: datos completos + asignación de huésped si no tiene uno.
- `AddBookingDialog`: estimación de precio antes de confirmar (consulta al backend).
- `PayBookingDialog`: registro de pago, historial de pagos y reversión del último pago.
- `BookingsTable`: vista adaptada a mobile con menú de acciones.

### Huéspedes

- CRUD con tipos de documento (`DU` / `EXTRANJERO`).
- `GuestsTable` con vista adaptada a mobile.

### Reportes Financieros

- Resumen mensual: ingresos, ocupación, rentabilidad y desglose de costos.
- Navegación por períodos (selector de mes).

### Usuarios

- `UsersTable` con listado y gestión de usuarios del sistema.

### Perfil de Usuario

- Edición de datos personales y cambio de contraseña.

## Utilidades Clave

- **`formatPrice(value)`**: enteros con punto como separador de miles (ej. `$1.500`).
- **`cn()`**: `clsx` + `tailwind-merge` para clases condicionales.
- **Date safety**: fechas como `YYYY-MM-DD` para evitar desfases por zona horaria.

## Idioma

- Strings de UI en `messages/en.json` y `messages/es.json`
- Nombres de código (clases, funciones, variables, archivos) en **inglés**
- Mensajes de error del backend pueden estar en **español** (los muestra tal cual)

## Comandos de Desarrollo

```bash
cd frontend && npm install
npm run dev     # → http://localhost:3000 (requiere API en :8000)
npm run build
npm run lint
```
