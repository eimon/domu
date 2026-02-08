# Domu - Sistema de Gestión de Alquiler Turístico

Proyecto creado con Vibecode utilizando patrones de diseño SOLID y Clean Architecture.

Domu es una plataforma integral diseñada para maximizar la rentabilidad de propiedades de alquiler turístico. Centraliza la gestión para administradores y ofrece transparencia total a los propietarios.

## 🚀 Visión General

El sistema permite la administración eficiente de múltiples propiedades, gestionando precios dinámicos, calendarios unificados y reportes financieros. Su núcleo es una estrategia de precios basada en rentabilidad real, permitiendo ajustes rápidos según la demanda del mercado y objetivos mensuales.

## 🛠 Tech Stack

El proyecto utiliza una arquitectura moderna y desacoplada:

*   **Backend / Core API**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
    *   Manejo de lógica de negocio, cálculos de precios y base de datos.
*   **Manager Web App**: [Next.js](https://nextjs.org/) (React)
    *   Dashboard administrativo para el gestor de propiedades.
*   **Owner Mobile App**: [Expo](https://expo.dev/) (React Native)
    *   Aplicación móvil para que los dueños consulten estado y ganancias.

## 🧩 Arquitectura del Sistema

```
graph TD
    User[Usuarios]
    
    subgraph Apps
        Manager[Manager Dashboard (Next.js)]
        Owner[Owner App (Expo)]
    end
    
    subgraph Core
        API[FastAPI Server]
        DB[(Database)]
    end
    
    User --> Manager
    User --> Owner
    Manager --> API
    Owner --> API
    API --> DB
```

## 💡 Funcionalidades Clave

### 1. Escala de Rentabilidad (0% - 100%)
Sistema de pricing dinámico que elimina el cálculo manual:
*   **0% (Piso)**: Precio break-even. Cubre costos fijos, variables y comisiones.
*   **100% (Techo)**: Precio ideal de mercado.
*   **Ajuste Dinámico**: El gestor define el % de ganancia deseada y el sistema calcula el precio final.

### 2. Gestión de Metas
*   Seguimiento de **Días de Ocupación** vs Objetivo.
*   Monitoreo de **Rentabilidad Promedio**.
*   Cálculo de **Costo de No Alquilar** (Pérdida por vacancia).

### 3. Roles
*   **Admin**: Control total del sistema.
*   **Gestor**: Control total de precios, disponibilidad y mantenimientos.
*   **Dueño**: Visibilidad de calendario, reporte de ingresos netos y acceso simplificado.