---
name: react-compatibility-service-builder
description: Creates or updates React API services in HiveFive to consume Spring compatibility endpoints with robust payload normalization (wrapper arrays and snake_case/camelCase tolerance). Use when adding or migrating frontend data access for legacy-compatible APIs.
disable-model-invocation: true
---

# React Compatibility Service Builder

## Goal
Implement reliable `frontend/src/services/*` modules for compatibility-shaped backend APIs.

## Use this skill when
- A migrated backend endpoint must be consumed in React.
- A JET fetch flow is being replaced with React services.
- Payload normalization bugs appear (`Board` vs array, `board_id` vs `boardId`).

## Rules
- Use `apiClient` from `frontend/src/config/api.ts`.
- Keep normalization helpers close to service functions.
- Support wrapper payloads and naming variants when backend contracts require it.
- Throw user-friendly errors through a shared helper pattern.

## Workflow
1. Inspect endpoint contract in `backend/hivefive-api-app/.../*CompatibilityController.java` and DTO in `hivefive-<domain>/web/dto`.
2. Define TypeScript response interfaces including compatibility variants.
3. Add normalization helpers:
   - wrapper extraction (example: `payload.Board`)
   - ID coercion to number
   - fallback keys (`snake_case` and `camelCase`)
4. Implement service CRUD methods with explicit request/response shapes.
5. Add or update service tests in `frontend/src/services/*.test.ts`.

## Service checklist
- [ ] No `fetch` in page/hook code for this domain.
- [ ] Request wrapper key is exact.
- [ ] Response wrapper key is exact.
- [ ] Key-name tolerance implemented where needed.
- [ ] Error message path is deterministic.

## Definition of done
- Service methods are the single source of backend interaction for the domain.
- Pages/hooks consume clean normalized objects.
- Tests verify normalization and error paths.
