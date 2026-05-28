---
name: migration-discovery-hivefive
description: Maps a legacy-to-modern migration scope in HiveFive by tracing middleware SOA/OSB modules, Spring Boot compatibility endpoints, and JET/React frontend counterparts. Use when the user asks to analyze impact, locate source and target files, or prepare a migration plan for a specific component.
disable-model-invocation: true
---

# Migration Discovery (HiveFive)

## Goal
Build a precise source-to-target map before changing code.

## Use this skill when
- The user asks to migrate a specific module/component.
- The user asks "where is X in SOA/OSB, Spring Boot, JET, React?".
- A migration task is ambiguous and needs exact file mapping first.

## Repository anchors
- Legacy middleware SOA/OSB: `middleware/CRUD_HIVEFIVE` and `middleware/OSB_HIVEFIVE`
- New backend: `backend/hivefive-api-app` (parent: `backend/pom.xml`)
- Legacy frontend: `frontend-jet/src/ts`
- Modern frontend: `frontend/src`

## Workflow
1. Identify migration component name from user request (example: `USER`, `BOARDS`, `CARD`, `STATUS`, `CHECKLIST`, `USER_BOARD`).
2. Locate legacy middleware artifacts:
   - `middleware/CRUD_HIVEFIVE/CRUD_<COMPONENT>/SOA/composite.xml`
   - `middleware/CRUD_HIVEFIVE/CRUD_<COMPONENT>/SOA/BPEL/*`
   - `middleware/OSB_HIVEFIVE/OSB_<COMPONENT>/*`
3. Locate target backend artifacts:
   - `backend/hivefive-api-app/src/main/java/com/hivefive/api/web/*CompatibilityController.java`
   - `backend/hivefive-*/src/main/java/com/hivefive/*/service/*Service.java`
   - corresponding DTO/entity/repository files.
4. Locate frontend counterparts:
   - Legacy JET ViewModel + view in `frontend-jet/src/ts/viewModels` and `frontend-jet/src/ts/views`
   - React services/pages/hooks in `frontend/src/services`, `frontend/src/pages`, `frontend/src/hooks`
5. Produce a migration map with:
   - legacy operation -> Spring endpoint
   - payload shape (legacy wrappers like `User`, `Board`, `Card`) -> DTO/service mapping
   - JET ViewModel responsibility -> React page/hook/service target
   - test assets to preserve behavior.

## Required output format
- `Component scope`
- `Source artifacts (legacy)`
- `Target artifacts (Spring/React)`
- `Contract parity risks`
- `Execution order`
- `Definition of done`

## Definition of done
- Every operation of the component has a source and target path.
- Endpoint and payload compatibility constraints are explicit.
- Frontend and backend touchpoints are listed.
- A safe incremental order is proposed (no big-bang migration).
