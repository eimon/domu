# Domu Frontend

[Read in English](README.md)

Este proyecto fue construido por Vibecoding, incorporando patrones estructurales probados de proyectos anteriores.

Una aplicación web moderna y de alto rendimiento para la gestión de propiedades, construida con Next.js 16, TypeScript y Tailwind CSS. Este proyecto sirve como frontend para la [API de Domu](https://github.com/eimon/domu-api).

## 🚀 Características

### 🔐 Autenticación y Seguridad
- **Autenticación basada en JWT**: Flujo de inicio de sesión seguro con gestión de cookies HTTP-only.
- **Protección de Rutas**: Verificación a nivel de middleware de tokens JWT usando `jose`.
- **Listo para RBAC**: Soporte para distintos roles de usuario (Admin, Manager, Owner).

### 🌍 Internacionalización (i18n)
- **Soporte multi-idioma completo**: Inglés (`en`) y Español (`es`) en toda la aplicación.
- **Enrutamiento Localizado**: Locales basados en la URL (ej. `/en/properties`, `/es/properties`).
- **Contenido Dinámico**: Traducción automática de elementos de la interfaz, formularios y constantes del sistema (Enums).

### 🏠 Gestión de Propiedades
- **Vista General del Panel**: Vista de cuadrícula de propiedades gestionadas con estado en tiempo real.
- **Detalles de Propiedad por Pestañas**:
  - **Detalles y Costos**: Gestionar información de la propiedad y costos recurrentes o únicos.
  - **Calendario**: Vista mensual interactiva de disponibilidad y precios diarios calculados.
  - **Reportes**: Resumen de rendimiento financiero incluyendo ingresos, costos y márgenes.
- **Precios Avanzados**: Crear y gestionar reglas de precios por temporada con lógica de prioridad.

### 📊 Información Financiera
- **Métricas Clave**: Resumen en tiempo real de Ingresos Totales, Costos, Margen de Beneficio y Tasa de Ocupación.
- **Cálculo Dinámico**: Los precios reflejan automáticamente las reglas de precios activas y los costos asociados.

## 🛠 Stack Tecnológico

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Estilo**: [Tailwind CSS v4](https://tailwindcss.com/)
- **i18n**: [next-intl](https://next-intl-docs.vercel.app/)
- **Cliente HTTP**: [Axios](https://axios-http.com/)
- **Validación**: [Zod](https://zod.dev/)
- **Iconos**: [Lucide React](https://lucide.dev/)

## 🏗 Arquitectura

- **Server Actions**: Mutaciones de datos seguras y con tipos, sin la necesidad de rutas de API manuales.
- **Proxy de Middleware**: Autenticación centralizada y manejo de locales.
- **Server Components**: Carga de datos optimizada y reducción del tamaño del bundle de JavaScript en el cliente.
- **Tipado Estricto**: Interfaces de TypeScript de extremo a extremo que coinciden con la API del backend.

## 🏁 Primeros Pasos

### 1. Requisitos Previos
Asegúrate de tener instalada la versión Linux de Node.js (se recomienda LTS).
```bash
nvm use lts
```

### 2. Configuración del Entorno
Crea un archivo `.env.local` en el directorio raíz y añade lo siguiente:
```env
JWT_SECRET_KEY=tu_clave_secreta_jwt_aqui
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Instalación
```bash
npm install
```

### 4. Ejecución del Servidor de Desarrollo
```bash
npm run dev
```
Navega a [http://localhost:3000](http://localhost:3000).

## 📦 Construcción y Despliegue

Para crear un paquete listo para producción:
```bash
npm run build
npm start
```

## 🤝 Contribución

Este proyecto sigue configuraciones estrictas de ESLint y TypeScript. Por favor, asegúrate de que todo el código pase el linting antes de enviar cambios.
```bash
npm run lint
```
