---
name: jet-viewmodel-to-react-screen
description: Migrates a legacy Oracle JET screen (ViewModel + HTML view) to React using HiveFive patterns: functional page, custom hook for complex logic, and API service integration. Use when converting a specific JET module to React with UX/i18n parity.
disable-model-invocation: true
---

# JET ViewModel -> React Screen

## Goal
Migrate one JET module into React without losing functional behavior.

## Use this skill when
- User asks to migrate one JET page or ViewModel.
- User asks for "same behavior but in React".
- A legacy module mixes UI/state/API and needs decomposition.

## Required target architecture
- Page UI in `frontend/src/pages/*`.
- Reusable UI in `frontend/src/components/*` if needed.
- Domain state/effects/handlers in `frontend/src/hooks/*`.
- API integration in `frontend/src/services/*` through `apiClient`.

## Migration mapping
- JET ViewModel state -> React `useState` + `useMemo`.
- JET lifecycle/fetch -> `useEffect` in hook.
- JET action handlers -> hook handlers returned to page.
- Direct `fetch` calls -> service functions with centralized `apiClient`.
- JET HTML bindings -> JSX with explicit props and event handlers.

## Workflow
1. Read legacy pair:
   - `frontend-jet/src/ts/viewModels/<module>.ts`
   - `frontend-jet/src/ts/views/<module>.html`
2. Extract:
   - state model
   - derived values
   - CRUD actions
   - loading/error/transient states
   - i18n keys used.
3. Build React target:
   - page component skeleton
   - hook with state + selectors + handlers
   - service calls (reusing or extending `frontend/src/services`)
4. Preserve behavior:
   - same validations
   - same main user flow
   - same success/error outcomes.
5. Add/adjust tests for page and/or service behavior.

## Mandatory rules
- Functional components only.
- No hardcoded API URLs in pages/hooks/components.
- All visible UI text via `t(key)` (i18n), including labels/placeholders/aria.
- Maintain CRUD parity for migrated entity (create/update/delete, not create-only).

## Output template
```markdown
Module migrated: <name>
Legacy files: <viewModel + view>
React files created/updated: <paths>
Behavior preserved: <bullets>
Known deltas: <bullets>
Test coverage: <bullets>
```

## Definition of done
- Legacy module behavior is reproducible from React routes/screens.
- Logic is decomposed into page + hook + service.
- i18n and UX states are complete.
