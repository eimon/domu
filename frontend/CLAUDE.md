# CLAUDE.md — Next.js Frontend Sub-Agent

Este archivo complementa el CLAUDE.md raíz. Contiene las convenciones exactas del código para trabajar dentro de `frontend/`.

**Referencia de features implementadas:** Consultar `AGENTS.md` en este directorio para el resumen completo de capacidades y módulos ya construidos.

## Stack Tecnológico

- **Framework:** Next.js 16 (App Router)
- **Lenguaje:** TypeScript (Strict Mode)
- **Estilos:** Tailwind CSS v4
- **Internacionalización:** `next-intl` (locales: `en`, `es`, default: `en`)
- **Autenticación:** JWT con `jose` (validado en Middleware)
- **Validación:** Zod
- **HTTP (client-side):** axios (`src/lib/api.ts`)
- **HTTP (server-side):** fetch nativo vía `serverApi` (`src/lib/server-api.ts`)

## Estructura de Directorios

```
frontend/src/
├── app/
│   └── [locale]/
│       ├── (auth)/auth/login/page.tsx     # Página pública de login
│       └── (dashboard)/                   # Rutas protegidas
│           ├── layout.tsx                 # Layout con Sidebar + Navbar
│           ├── page.tsx                   # Dashboard principal (propiedades)
│           ├── properties/
│           │   ├── page.tsx               # Listado de propiedades
│           │   ├── new/page.tsx           # Crear propiedad
│           │   └── [id]/page.tsx          # Detalle tabulado de propiedad
│           ├── bookings/page.tsx
│           └── guests/page.tsx
├── actions/                               # Server Actions (lógica CRUD)
│   ├── auth.ts
│   ├── bookings.ts
│   ├── calendar.ts
│   ├── costs.ts
│   ├── guests.ts
│   ├── pricing.ts
│   ├── properties.ts
│   └── reports.ts
├── components/                            # Componentes reutilizables (Client)
├── context/                               # React Context (SidebarContext)
├── i18n/
│   ├── routing.ts                         # Definición de locales y navegación
│   └── request.ts                         # Config de next-intl para RSC
├── lib/
│   ├── api.ts                             # axios client (browser, con token en localStorage)
│   └── server-api.ts                      # fetch helper (server, con token en cookie)
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

// 1. Schema de validación con Zod
const domainSchema = z.object({
    name: z.string().min(1, "Name is required"),
});

// 2. Tipo de estado para useActionState
export type DomainFormState = {
    error?: string;
    success?: boolean;
};

// 3. Action que recibe (prevState, formData) → para useActionState
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

// 4. Actions de solo lectura (no usan prevState)
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

## Autenticación

- **Login:** Server Action `login()` en `actions/auth.ts` — obtiene el token del backend y lo guarda en cookie `httpOnly`
- **Logout:** Server Action `logout()` — borra la cookie y redirige a login
- **Token:** Cookie `access_token` (server) / `localStorage` `access_token` (client, para axios)
- **Variable de entorno frontend:** `NEXT_PUBLIC_API_URL` (default: `http://localhost:8000/api/v1`), `JWT_SECRET_KEY`

## Enums del Dominio

Definidos en `src/types/api.ts`, espejo de los enums del backend:

| Enum | Valores |
|------|---------|
| `BookingStatus` | `CONFIRMED`, `TENTATIVE`, `CANCELLED` |
| `BookingSource` | `AIRBNB`, `BOOKING`, `DOMU`, `MANUAL` |
| `DocumentType` | `DU`, `EXTRANJERO` |
| `UserRole` | `ADMIN`, `MANAGER`, `OWNER` |
| `CostCategory` | `RECURRING_MONTHLY`, `RECURRING_DAILY`, `PER_RESERVATION` |
| `CostCalculationType` | `FIXED_AMOUNT`, `PERCENTAGE` |

## Comandos de Desarrollo

```bash
# Instalar dependencias
cd frontend && npm install

# Servidor de desarrollo (requiere API corriendo en :8000)
npm run dev   # → http://localhost:3000

# Build de producción
npm run build

# Lint
npm run lint
```

## Idioma

- Strings de UI en `messages/en.json` y `messages/es.json`
- Nombres de código (clases, funciones, variables, archivos) en **inglés**
- Mensajes de error del backend pueden estar en **español** (los muestra tal cual)
