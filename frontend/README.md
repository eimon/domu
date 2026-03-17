# Domu Frontend

Una aplicación web moderna para la gestión de propiedades de alquiler turístico, construida con Next.js 16, TypeScript y Tailwind CSS v4. Sirve como frontend para la [API de Domu](https://github.com/eimon/domu-api).

---

## Stack Tecnológico

| Tecnología | Uso |
|---|---|
| [Next.js 16](https://nextjs.org/) (App Router) | Framework principal |
| [TypeScript](https://www.typescriptlang.org/) (Strict Mode) | Lenguaje |
| [Tailwind CSS v4](https://tailwindcss.com/) | Estilos |
| [next-intl](https://next-intl-docs.vercel.app/) | Internacionalización (EN/ES) |
| [Zod](https://zod.dev/) | Validación |
| [Axios](https://axios-http.com/) | HTTP client-side |
| [Lucide React](https://lucide.dev/) | Iconos |
| `jose` | Validación JWT en Middleware |

---

## Arquitectura

- **Server Actions** (`src/actions/`): Toda la lógica de mutaciones de datos (CRUD) vive aquí — llamadas a la API, validación con Zod y revalidación de caché. Siempre `"use server"`.
- **`serverApi`** (`src/lib/server-api.ts`): Helper para Server Components y Actions. Lee el token desde la cookie `access_token`.
- **`api` (axios)** (`src/lib/api.ts`): Solo para Client Components que requieran interacción en tiempo real. Lee el token desde `localStorage`.
- **Server Components**: Las páginas obtienen datos directamente con `serverApi`. Minimizan el bundle del cliente.
- **Middleware** (`src/middleware.ts`): Valida el JWT y gestiona el redireccionamiento por locale. Requiere `JWT_SECRET_KEY`.
- **URL Search Params**: Estado persistente de UI (tabs, filtros, selecciones).

**Flujo de request:** Página (Server Component) → Server Action → `serverApi` → API backend.

---

## Design System — "Obsidian Glass"

Sistema de diseño oscuro con glassmorphism. Documentado en `DESIGN_SYSTEM.md` y aplicado en `globals.css`.

**Clases glass:**
- `.glass` — superficie base translúcida
- `.glass-elevated` — superficie elevada (cards)
- `.glass-modal` — modales y diálogos
- `.glass-sidebar` — barra lateral

**Tokens de color:**
| Token | Valor | Uso |
|---|---|---|
| `domu-primary` | `#818cf8` | Acciones principales, links activos |
| `domu-success` | `#34d399` | Estados positivos, confirmación |
| `domu-warning` | `#fbbf24` | Advertencias |
| `domu-danger` | `#f87171` | Errores, eliminación |
| `domu-base` | `#0f1117` | Fondo base |

Todos los modales y diálogos usan `glass-modal rounded-2xl shadow-2xl`.

---

## Sistema Global de UI

- **Toast notifications**: `ToastContext` (`src/context/ToastContext.tsx`) — `showError(msg)` / `showSuccess(msg)` vía `useToast()`.
- **Diálogos de confirmación**: `ConfirmContext` (`src/context/ConfirmContext.tsx`) — `await confirm(mensaje)` devuelve `boolean` vía `useConfirm()`.

Ambos contextos están registrados en el layout raíz y disponibles en cualquier Client Component.

---

## Características Implementadas

### 1. Autenticación y Seguridad

- Flujo JWT con cookies `httpOnly`. Login y logout vía Server Actions (`actions/auth.ts`).
- Protección de rutas a nivel de middleware — redirige a `/{locale}/auth/login` si el token es inválido o falta.
- Refresco de token automático sin duplicar peticiones concurrentes.
- RBAC: roles `ADMIN`, `MANAGER`, `OWNER` con permisos jerárquicos.
- Gestión de perfil de usuario con cambio de contraseña.

### 2. Dashboard (Home)

- **KPIs del mes**: total de propiedades, ingresos mensuales, ganancia neta y ocupación promedio, agregados de todas las propiedades.
- **Resumen por propiedad**: lista con ocupación, ingresos y ganancia del mes actual.
- **Próximos check-ins**: panel lateral con reservas en los próximos 7 días (no canceladas).
- Datos obtenidos con `Promise.all` server-side para máximo paralelismo.

### 3. Gestión de Propiedades

- **CRUD completo**: creación, edición y eliminación con validaciones de negocio.
- **Autocompletado de dirección**: `AddressAutocomplete` con Nominatim (OpenStreetMap) + miniatura de mapa.
- **Detalle tabulado** con tres pestañas:
  - **Detalles y Costos** — información general y tabla de costos.
  - **Calendario** — vista mensual interactiva.
  - **Reportes** — resumen financiero.

### 4. Costos y Precios Dinámicos

- **Categorías de costo**: `RECURRING_MONTHLY`, `PER_DAY_RESERVATION`, `PER_RESERVATION`; cada una con tipo `FIXED_AMOUNT` o `PERCENTAGE`.
- **Versionado temporal de costos**: cada costo tiene historial con `start_date`/`end_date`. Acciones disponibles:
  - Modificar valor con fecha de vigencia (`ModifyCostDialog`)
  - Ver historial de versiones (`PriceHistoryDialog`)
  - Revertir al valor anterior
  - **Finalizar costo** (`FinalizeCostDialog`) — cierra la versión activa con una `end_date`
- **`base_price` con historial**: mismo patrón de versionado aplicado al precio base (`BasePriceCard`).
- **Reglas de precio**: períodos con rentabilidad % personalizada, visualizados en el calendario.
- **CostsTable**: vista de tabla en desktop y tarjetas en mobile con menú de acciones.

### 5. Calendario Interactivo

- Vista mensual de disponibilidad y precios calculados diariamente.
- Refleja automáticamente reglas de precio activas y costos vigentes en cada fecha.

### 6. Huéspedes

- Administración con tipos de documento (`DU` / `EXTRANJERO`).
- Tabla con vista adaptada a mobile.

### 7. Reservas y Pagos

- **Estados de reserva**: `TENTATIVE`, `CONFIRMED`, `CANCELLED`, `PAID`.
- **Acciones por estado**: confirmar (TENTATIVE), cancelar (TENTATIVE/CONFIRMED), eliminar (CANCELLED).
- **Modal de detalle** (`BookingDetailModal`): datos completos — fechas, fuente, contacto del huésped.
  - Si no tiene huésped asignado, muestra formulario de asignación desde la lista existente.
- **Estimación de precio** (`AddBookingDialog`): al seleccionar propiedad y fechas, el diálogo consulta el precio estimado antes de confirmar.
- **Gestión de pagos** (`PayBookingDialog`):
  - Registro de pago con monto real cobrado.
  - Vista del historial de pagos de la reserva.
  - Reversión del último pago registrado.
- **BookingsTable**: vista adaptada a mobile con menú de acciones.

### 8. Reportes Financieros

- Resumen mensual de ingresos, ocupación y rentabilidad con desglose de costos.
- Selector de período con navegación fluida por meses.

### 9. Gestión de Usuarios

- `UsersTable` con listado y acciones sobre usuarios del sistema.

---

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

---

## Utilidades Clave

- **`formatPrice(value)`**: convierte montos a string con enteros y punto como separador de miles (ej. `$1.500`).
- **`cn()`**: helper de `clsx` + `tailwind-merge` para clases condicionales.
- **Date safety**: fechas manejadas como `YYYY-MM-DD` para evitar desfases por zona horaria.

---

## Primeros Pasos

### 1. Variables de entorno

Crea `frontend/.env.local`:
```env
JWT_SECRET_KEY=tu_clave_secreta_jwt_aqui
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 2. Instalación

```bash
cd frontend && npm install
```

### 3. Servidor de desarrollo

Requiere la API corriendo en `localhost:8000` (ver `docker compose up` en la raíz).

```bash
npm run dev   # → http://localhost:3000
```

### 4. Build de producción

```bash
npm run build
npm start
```

### 5. Lint

```bash
npm run lint
```

---

## Internacionalización

- Locales soportados: `en` (default), `es`.
- Archivos de mensajes: `messages/en.json` y `messages/es.json`.
- Rutas localizadas: `/en/properties`, `/es/properties`, etc.
- Nombres de código (clases, funciones, variables, archivos) en **inglés**.
- Mensajes de error del backend se muestran tal cual (pueden estar en español).

---

*Última actualización: Marzo 2026*
