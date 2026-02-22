# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Domu is a vacation rental management platform (sistema de gestión de alquiler turístico) built with FastAPI. It manages properties, bookings, dynamic pricing, and costs for administrators, managers, and property owners. The project is in Spanish (domain terms, error messages, some endpoint paths like `/auth/perfil`).

## Development Commands

```bash
# Start the stack (FastAPI + PostgreSQL 16)
docker compose up --build

# API runs on http://localhost:8000
# OpenAPI docs at http://localhost:8000/api/v1/openapi.json
# Swagger UI at http://localhost:8000/docs

# Run tests (inside the running container)
docker exec domu_api pytest tests/ -v

# Run Alembic migrations manually
docker exec domu_api alembic upgrade head
docker exec domu_api alembic revision --autogenerate -m "description"
```

Database migrations run automatically on container start via `entrypoint.sh` → `alembic upgrade head`.

**Required environment variables:** `SECRET_KEY`, `DATABASE_URL` (set in docker-compose), optional `ALGORITHM` (default HS256), `DOMAIN` (default domu.ar).

## Architecture

The API source lives in `api/` and follows a layered architecture:

```
api/
├── main.py                    # App entry, lifespan, router registration
├── core/                      # Config, DB engine, security, enums, roles
├── models/                    # SQLAlchemy ORM models (UUID PKs, async)
├── schemas/                   # Pydantic schemas (Create/Update/Response)
├── repositories/              # Data access layer (async SQLAlchemy queries)
├── services/                  # Business logic (validation, orchestration)
├── dependencies/auth.py   # Auth dependencies (get_current_user, has_role)
├── routers/            # Route handlers per domain
└── exceptions/                # Custom exceptions + FastAPI handlers
```

**Request flow:** Router → Service → Repository → DB. Routers never access the database directly.

**Database sessions** auto-commit on success and auto-rollback on exception (see `core/database.py:get_db`).

**Auth:** JWT tokens with `sub` (user UUID) and `role` claims. OAuth2PasswordBearer flow. Role-based access via `has_role()` dependency. Roles: ADMIN > MANAGER > OWNER with hierarchical permissions defined in `core/roles.py`.

## Key Domain Concepts

- **Pricing model:** Property `base_price` is the gross price per night at 100% profitability. Floor price is calculated from costs. Profitability percentage scales between floor (0%) and base price (100%). PricingRules apply date-range overrides with priority-based resolution and overlap validation.
- **Bookings** use iCal UIDs, date-only fields (no time component), and validate against date conflicts. Sources: AIRBNB, BOOKING, DOMU, MANUAL.
- **Costs** are categorized as RECURRING_MONTHLY, RECURRING_DAILY, or PER_RESERVATION, each either FIXED_AMOUNT or PERCENTAGE.

## Conventions

- All database operations are async (asyncpg + SQLAlchemy async)
- Models use PostgreSQL UUID type for primary keys
- Schemas use `Config.from_attributes = True` for ORM compatibility
- Custom exceptions (`NotFoundException`, `ForbiddenException`, etc.) with centralized handlers in `exceptions/handlers.py`
- List endpoints accept `skip`/`limit` query params (limit max 100)
- Monetary values use `Decimal`
- All routers are prefixed with `/api/v1`

## Sub-Agent: api/

El directorio `api/` tiene su propio `CLAUDE.md` con las convenciones exactas de código (patrones de model, schema, repository, service, router), enums, permisos y deploy. Cuando trabajes en código dentro de `api/`, consultalo para seguir los patrones establecidos. También existe `api/API_ENDPOINTS.md` como especificación completa de la API.

## Sub-Agent: frontend/

El directorio `frontend/` tiene su propio `CLAUDE.md` con las convenciones exactas del frontend: stack (Next.js 16, TypeScript, Tailwind v4, next-intl), estructura de directorios, patrones de Server Actions, helpers de API (`serverApi` vs axios), componentes, i18n y autenticación. Cuando trabajes en código dentro de `frontend/`, consultalo para seguir los patrones establecidos. También existe `frontend/AGENTS.md` como resumen de las features ya implementadas.
