# Arquitectura actual

## Vista general

HiveFive2026 se organiza en tres bloques principales:

- Frontend React (`frontend/src`)
- API Spring Boot multi-modulo (`backend/`, modulo ejecutable `hivefive-api-app`)
- Documentacion (`docs`)

En el repo tambien existe un modulo legacy (`frontend/web`) basado en Oracle JET, mantenido como referencia.

## Flujo funcional end-to-end

1. El usuario interactua con la SPA React (login, dashboard, board detail).
2. La UI realiza peticiones HTTP al backend en `http://localhost:8080/api/v1/...`.
3. El backend aplica validaciones y reglas de negocio.
4. La capa de persistencia gestiona entidades JPA sobre MySQL/H2.
5. La API responde JSON y el frontend actualiza estado local.

## Capas del backend

Maven multi-modulo: cada dominio (`user`, `board`, `card`, …) en `hivefive-<dominio>` con **domain**, **repository**, **service** y **web.dto**.

- **hivefive-api-app (web)**
  - `*CompatibilityController`, `GlobalExceptionHandler`, config, orquestacion (`DomainOrchestrationService`).
- **hivefive-* (dominio)**
  - Reglas de negocio y persistencia JPA por bounded context.
- **hivefive-common**
  - Excepciones y `ErrorResponse` compartidos.

## Capas del frontend (React)

- **Pages**
  - Pantallas de login, registro, dashboard y detalle de board.
- **Components**
  - Componentes reutilizables (ej. `KanbanCard`, selector de idioma).
- **Hooks**
  - Logica de dominio de UI (ej. `useBoard`).
- **Services**
  - Adaptadores de API para auth, boards, cards, checklist y status.
- **i18n**
  - Contexto de idioma ES/EN con persistencia en `localStorage`.

## Modulos funcionales

- Autenticacion y registro.
- Gestion de tableros por usuario.
- Gestion Kanban de tarjetas por estado.
- Subtareas por tarjeta.
- Relacion user-board.
- Internacionalizacion de interfaz (ES/EN).

## Testing y calidad

- Backend:
  - Integracion H2 (suite principal).
  - Integracion RealDB (opcional con flag).
- Frontend:
  - Unit tests y pruebas de integracion de UI con Vitest + Testing Library.
  - Linting con ESLint.
  - Build type-safe con TypeScript.
