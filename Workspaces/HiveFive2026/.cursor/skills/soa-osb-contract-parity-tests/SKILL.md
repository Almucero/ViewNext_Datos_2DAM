---
name: soa-osb-contract-parity-tests
description: Builds and verifies contract-parity tests for migrated SOA/OSB components in HiveFive by aligning legacy operation behavior with Spring Boot integration tests and compatibility payloads. Use when validating migration correctness or preventing regressions.
disable-model-invocation: true
---

# SOA/OSB Contract Parity Tests

## Goal
Ensure each migrated component keeps the same externally observable behavior.

## Use this skill when
- A middleware component was migrated and needs parity proof.
- User requests robust regression coverage.
- Behavior mismatch appears between legacy payload and new backend responses.

## Sources of truth
- Legacy tests and templates:
  - `middleware/CRUD_HIVEFIVE/**/SOA/testsuites`
  - `middleware/CRUD_HIVEFIVE/**/SOA/templates`
- Backend integration tests:
  - `backend/hivefive-api-app/src/test/java/com/hivefive/api/tests/h2`
  - `backend/hivefive-api-app/src/test/java/com/hivefive/api/tests/realdb`
- Error contract:
  - `ErrorResponse` (`codigo`, `mensaje`)

## Workflow
1. Identify migrated component and legacy test scenarios (happy/minimal/not-found/edge).
2. Translate each scenario into Spring integration tests:
   - keep semantic intent, not XML tooling specifics.
3. Validate:
   - endpoint path and HTTP method
   - request payload wrapper keys
   - response wrapper keys and field typing
   - validation and not-found semantics
4. Cover both profile lanes when applicable:
   - H2 suite always
   - RealDB gated suite when user requests deep parity.

## Minimum test matrix per component
- `get-all`: list non-empty or deterministic shape.
- `get/{id}`: success + not found.
- `create`: success + required field validation.
- `update`: success + invalid/not found behavior.
- `delete`: success + post-delete behavior.

## Output format
- `Paridad cubierta` (cases mapped from legacy)
- `Paridad pendiente` (gaps)
- `Riesgos de compatibilidad`
- `Next hardening actions`

## Definition of done
- New tests assert compatibility wrappers and expected status codes.
- Regression risk is explicit and reduced.
- No undocumented behavior drift remains for migrated operations.
