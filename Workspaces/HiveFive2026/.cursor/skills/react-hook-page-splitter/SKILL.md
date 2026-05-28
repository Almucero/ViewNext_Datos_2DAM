---
name: react-hook-page-splitter
description: Refactors React screens in HiveFive into a clean page-hook-service split, extracting non-trivial state/effects/handlers into custom hooks and keeping UI components focused. Use when a page grows complex or during JET-to-React migration cleanup.
disable-model-invocation: true
---

# React Hook/Page Splitter

## Goal
Keep React screens maintainable by separating UI from orchestration logic.

## Use this skill when
- A page has too many effects/handlers.
- Migration produced monolithic TSX files.
- Repeated state transitions or async flows are hard to test.

## Target contract for hooks
Return object grouped as:
- `state`: loading, error, domain state, transient IDs.
- `selectors`: derived values (`useMemo`).
- `handlers`: create/update/delete/drag/drop actions.

## Workflow
1. Identify logic clusters in a page:
   - data loading
   - validation
   - async mutations
   - optimistic updates.
2. Create or update hook in `frontend/src/hooks/*`.
3. Move logic from page to hook while keeping behavior unchanged.
4. Keep page focused on rendering and wiring UI events to hook handlers.
5. Ensure services remain in `frontend/src/services/*`.

## Guardrails
- No business API calls directly inside JSX event blocks.
- No direct localStorage auth logic duplicated across many pages if route guard already handles access.
- Keep transient UX flags explicit (`savingId`, `deletingId`, `draggingId` pattern).

## Definition of done
- Page is mostly declarative UI.
- Hook encapsulates domain logic and side effects.
- Behavior and tests remain stable or improved.
