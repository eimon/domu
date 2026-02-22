# Domu Frontend - Agents Summary

Este archivo contiene un resumen consolidado de las capacidades, arquitectura y características implementadas en el frontend de Domu hasta la fecha.

## 🛠 Stack Tecnológico
- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript (Strict Mode)
- **Estilos**: Tailwind CSS v4
- **Internacionalización**: `next-intl` (Soporte completo EN/ES)
- **Autenticación**: JWT con `jose` (Validación en Middleware/Proxy)

## 🏗 Arquitectura y Core
- **Rutas Protegidas**: Middleware centralizado (`src/proxy.ts`) que valida el JWT y gestiona el redireccionamiento por idioma.
- **Data Fetching**: 
    - `serverApi`: Helper para consumos seguros desde Server Components.
    - **Server Actions**: Implementación de lógica de negocio (CRUD) en el servidor para Auth, Propiedades, Huéspedes y Reservas.
- **Persistencia de Estado**: Uso extensivo de URL Search Params para mantener el estado de pestañas y selecciones durante recargas y navegación.

## 🚀 Características Implementadas

### 1. Gestión de Propiedades
- **Dashboard**: Vista de grilla de propiedades gestionadas por el usuario.
- **Detalle Tabulado**: Interfaz moderna con pestañas: **Detalles y Costos**, **Calendario** y **Reportes**.
- **CRUD Completo**: Creación, edición y eliminación (soft delete) con validaciones de negocio.

### 2. Costos y Precios Dinámicos
- **Configuración de Costos**: Gestión de costos fijos mensuales, diarios y por reserva.
- **Reglas de Precio**: Sistema de reglas por prioridad y fechas para ajustar la rentabilidad dinámica.
- **Calendario Interactivo**: Visualización mensual de disponibilidad y precios calculados en tiempo real.

### 3. Huéspedes y Reservas
- **Huéspedes**: Administración de base de datos de clientes con tipos de documento (DU/Extranjero).
- **Reservas**: 
    - Creación de reservas vinculadas a propiedades y huéspedes.
    - Mapeo automático de nombres y fuentes (Airbnb, Booking.com, Manual, etc.).
    - Validación automática de conflictos de fechas.

### 4. Inteligencia Financiera
- **Reportes Mensuales**: Resumen de ingresos, ocupación y rentabilidad.
- **Desglose de Costos**: Visualización detallada de egresos operativos y deducción automática de comisiones.
- **Selector de Período**: Navegación fluida por meses con integración real del backend.

## 🔧 Utilidades Clave
- **Date Safety**: Lógica robusta para manejo de fechas (YYYY-MM-DD) evitando desfases por zona horaria.
- **UI System**: Componentes reutilizables con iconos de `lucide-react` y transiciones animadas para una experiencia premium.

---
*Última actualización: Febrero 2026*
