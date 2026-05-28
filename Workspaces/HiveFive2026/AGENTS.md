# AGENTS.md

## Purpose
This file defines the operating context and non-negotiable implementation rules for AI agents working in this repository.

The project has two active worlds:
- Legacy frontend in `frontend-jet/` (Oracle JET with Knockout/ViewModels).
- Modern frontend in `frontend/` (React + Vite + TypeScript).
- Backend API in `backend/hivefive-api-app` (Spring Boot + JPA + MySQL; parent POM: `backend/pom.xml`).

Always preserve compatibility with existing contracts and naming conventions.

## Mandatory Architecture Rules

### Frontend (React)
- Use functional components only. Do not introduce class components.
- For non-trivial screen logic, split concerns as:
  - UI in page/component.
  - state/effects/handlers in custom hooks under `frontend/src/hooks/`.
  - HTTP access in services under `frontend/src/services/`.
- Use centralized Axios client (`frontend/src/config/api.ts`) for all API calls.
- Keep routing declarative with `react-router-dom`; keep auth checks in route guards (not scattered in components).
- Respect current authenticated scope (`boards`, board detail, `profile`) unless explicitly requested otherwise.

### Frontend UX/UI and i18n
- Keep corporate visual system (blue/navy/white) from global CSS (`frontend/src/index.css`).
- Reuse shared utility classes and semantic tokens; avoid ad-hoc styling fragmentation.
- Prioritize clear hierarchy, readable forms, explicit actions, and friendly loading/error states.
- Enforce complete CRUD parity for key entities (`Boards`, `Cards`) when a screen is considered migrated.
- All visible UI text must come from i18n (`t(key)`); do not leave hardcoded JSX strings.

### Backend (Spring Boot + JPA + MySQL)
- Every entity must define exact `@Table(name = "...")` matching the real MySQL table.
- Table naming convention is singular. Do not pluralize table names.
- Special case: table `user` is reserved; escape as `` `user` `` when writing native SQL.
- Keep schema management disabled at runtime:
  - `spring.jpa.hibernate.ddl-auto: none`
  - keep schema-generation policy as none.
- Keep `hibernate.globally_quoted_identifiers: true`.
- Keep explicit local CORS origins for Vite/legacy local dev:
  - `http://localhost:5173`
  - `http://localhost:5174`
  - `http://localhost:8000`
- Local backend startup must target real MySQL directly (no docker-compose default flow).

## Migration Mapping (JET -> React)
When translating legacy JET modules:
- JET ViewModel responsibilities map to:
  - React component (render/composition),
  - custom hook (state, effects, handlers, validations),
  - service layer (API access + payload normalization).
- Do not recreate monolithic ViewModel-style logic inside React components.

## Data and API Compatibility
- Normalize backend compatibility-style payloads and tolerate legacy field naming when needed.
- Keep validation/sanitization close to custom hooks before calling backend services.
- Return i18n keys for business errors where possible (avoid hardcoded user-facing error strings in services).

## Anti-Patterns to Avoid
- Introducing React class components.
- Calling `fetch` or hardcoding API URLs outside centralized API/services.
- Mixing heavy side-effects directly into UI components when hook extraction is warranted.
- Declaring migration complete with list/create but missing update/delete.
- Reintroducing admin routes/views without explicit requirement.
- Allowing Hibernate to auto-create/alter schema in runtime.
- Introducing plural table names or unescaped native SQL against `user`.

## Practical Execution Checklist (for agents)
Before finishing a task, verify:
- Architecture split is respected (UI vs hooks vs services).
- No hardcoded UI strings remain in React TSX.
- Backend entity/table mappings remain exact and singular.
- No runtime schema mutation settings were introduced.
- Any new endpoint integration uses centralized API client and domain service modules.
