# Domu Frontend - Agents Summary

Este archivo contiene un resumen consolidado de las capacidades, arquitectura y características implementadas en el frontend de Domu hasta la fecha.

## 🛠 Stack Tecnológico
- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript (Strict Mode)
- **Estilos**: Tailwind CSS v4
- **Internacionalización**: `next-intl` (Soporte completo EN/ES)
- **Autenticación**: JWT con `jose` (Validación en Middleware)

## 🎨 Design System — "Obsidian Glass"

Sistema de diseño oscuro con glassmorphism. Documentado en `DESIGN_SYSTEM.md` y `globals.css`.

- **Clases glass**: `.glass`, `.glass-elevated`, `.glass-modal`, `.glass-sidebar`
- **Tokens de color**: `domu-primary` (#818cf8), `domu-success` (#34d399), `domu-warning` (#fbbf24), `domu-danger` (#f87171), `domu-base` (#0f1117)
- **Todos los modales y diálogos** usan `glass-modal rounded-2xl shadow-2xl`
- **Inputs**: constantes `inputCls` y `labelCls` definidas en cada componente de formulario

## 🏗 Arquitectura y Core

- **Rutas Protegidas**: Middleware centralizado que valida el JWT y gestiona el redireccionamiento por idioma.
- **Data Fetching**:
    - `serverApi`: Helper para consumos seguros desde Server Components (lee cookie `access_token`).
    - **Server Actions**: Lógica de negocio (CRUD) en el servidor para Auth, Propiedades, Huéspedes, Reservas y Costos.
- **Persistencia de Estado**: URL Search Params para estado de pestañas y selecciones.
- **Formato de precios**: `formatPrice()` en `src/lib/utils.ts` — enteros sin centavos, punto como separador de miles (`$1.500`).

## 🔔 Sistema Global de UI

- **Toast notifications**: `ToastContext` (`src/context/ToastContext.tsx`) — `showError(msg)` y `showSuccess(msg)`. Disponible vía `useToast()`.
- **Diálogos de confirmación**: `ConfirmContext` (`src/context/ConfirmContext.tsx`) — `await confirm(mensaje)` devuelve `boolean`. Disponible vía `useConfirm()`.
- Ambos contextos están registrados en el layout raíz y disponibles en cualquier Client Component.

## 🚀 Características Implementadas

### 1. Dashboard (Home)

- **KPIs del mes**: total de propiedades, ingresos mensuales, ganancia neta y ocupación promedio agregados de todas las propiedades.
- **Resumen de propiedades**: lista de propiedades con ocupación, ingresos y ganancia del mes actual.
- **Próximos check-ins**: panel lateral con reservas en los próximos 7 días (no canceladas).
- Datos obtenidos con `Promise.all` server-side para máximo paralelismo.

### 2. Gestión de Propiedades

- **Detalle Tabulado**: pestañas **Detalles y Costos**, **Calendario** y **Reportes**.
- **CRUD Completo**: creación, edición y eliminación con validaciones de negocio.
- **Autocompletado de dirección**: `AddressAutocomplete` con Nominatim (OpenStreetMap).

### 3. Costos y Precios Dinámicos

- **Categorías de costos**: `RECURRING_MONTHLY` (mensual fijo), `PER_DAY_RESERVATION` (por día de reserva, ej. desayuno), `PER_RESERVATION` (por reserva).
- **Versionado temporal**: costos y `base_price` tienen historial de cambios con `start_date`/`end_date`. Se puede modificar el valor con fecha de vigencia y revertir al anterior.
- **Reglas de Precio**: períodos con rentabilidad % personalizada, visualizadas en el calendario.
- **Calendario Interactivo**: visualización mensual de disponibilidad y precios calculados.

### 4. Huéspedes y Reservas

- **Huéspedes**: administración con tipos de documento (DU/Extranjero).
- **Reservas**:
    - Tabla con acciones por estado: confirmar (TENTATIVE), cancelar (TENTATIVE/CONFIRMED), eliminar (CANCELLED).
    - **Modal de detalle**: al hacer click en el ojo (Eye) se abre `BookingDetailModal` con datos completos de la reserva, fechas, fuente y datos de contacto del huésped.
    - **Asignación de huésped**: si la reserva no tiene huésped asignado, el modal muestra un formulario para asignar uno desde la lista existente.

### 5. Inteligencia Financiera

- **Reportes Mensuales**: resumen de ingresos, ocupación y rentabilidad con desglose de costos.
- **Selector de Período**: navegación fluida por meses.

## 🔧 Utilidades Clave

- **`formatPrice(value)`**: convierte montos a string con enteros y punto como separador de miles.
- **Date Safety**: manejo de fechas en `YYYY-MM-DD` evitando desfases por zona horaria.
- **`cn()`**: helper de `clsx` + `tailwind-merge` para clases condicionales.

---
*Última actualización: Marzo 2026*
