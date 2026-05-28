---
name: component-migration-orchestrator
description: Orchestrates end-to-end migration of one functional component in HiveFive across middleware, Spring Boot, and frontend layers using a phased plan and strict checkpoints. Use when the user asks for a complete component migration with detailed execution steps.
disable-model-invocation: true
---

# Component Migration Orchestrator

## Goal
Execute one component migration in controlled phases, avoiding cross-domain drift.

## Use this skill when
- User asks to migrate a full component end-to-end.
- Work spans middleware mapping, backend implementation, and frontend adaptation.
- User requests detailed and specific execution.

## Input required from user
- Component name (`USER`, `BOARDS`, `CARD`, `STATUS`, `ROLE`, `CHECKLIST`, `USER_BOARD`)
- Scope (`backend only`, `frontend only`, `full-stack`)
- Compatibility mode (`strict`, `can evolve`)

## Phase plan
1. **Discovery**
   - Use source/target mapping across `middleware`, `backend`, `frontend-jet`, `frontend`.
2. **Contract freeze**
   - Write exact endpoint and payload contract to preserve.
3. **Backend migration**
   - Apply `soa-osb-component-to-springboot` skill.
4. **Frontend migration**
   - Apply `jet-viewmodel-to-react-screen` and `react-compatibility-service-builder`.
5. **Quality pass**
   - Apply `soa-osb-contract-parity-tests` and `react-i18n-ux-parity-migration`.
6. **Closure**
   - List residual risks and next incremental slice.

## Required deliverables per phase
- Files touched
- Behavioral changes
- Compatibility checks
- Tests executed or pending

## Definition of done
- Selected component migrated in requested scope.
- Compatibility contract is either preserved or explicitly versioned.
- Risks and follow-up tasks are documented.
