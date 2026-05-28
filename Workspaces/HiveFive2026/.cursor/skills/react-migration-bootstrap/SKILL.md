---
name: react-migration-bootstrap
description: Bootstraps a React migration frontend module with Vite + TypeScript and migration-ready structure (pages, hooks, services, i18n, routing, API client). Use when the user asks to initialize a new React project for migrating Oracle JET screens.
disable-model-invocation: true
---

# React Migration Bootstrap

## Goal
Initialize a React project prepared for JET-to-React migration from day one.

## Use this skill when
- User asks to create/initialize a React migration project.
- User asks for "iniciar proyecto React para migración".
- Legacy JET modules need a modern target frontend scaffold.

## Default stack baseline
- React + TypeScript
- Vite
- React Router
- Axios
- Vitest + Testing Library

## Bootstrap workflow
1. Confirm target path (example: `frontend` or `frontend-new`).
2. Initialize app scaffold with Vite + TypeScript.
3. Install baseline deps (`react-router-dom`, `axios`) and test/lint tooling.
4. Create migration-ready structure:
   - `src/pages`
   - `src/components`
   - `src/hooks`
   - `src/services`
   - `src/config`
   - `src/test`
5. Add core files:
   - `src/config/api.ts` (centralized API client)
   - `src/App.tsx` (routing + optional protected routes)
   - `src/i18n.tsx` (language provider + `t(key)`)
   - global style baseline (`src/index.css`)
6. Add one sample page + one sample service + one smoke test.
7. Verify dev/build/test scripts.

## Migration-ready conventions (important)
- Keep UI logic in pages/components and non-trivial orchestration in hooks.
- Keep API calls only in services through centralized Axios client.
- Enforce i18n-first UI text (`t(key)`) from start.
- Prefer incremental migration by feature/module, not big-bang replacement.

## Suggested commands
```bash
# example for a new app
npm create vite@latest frontend-new -- --template react-ts
cd frontend-new
npm install
npm install react-router-dom axios
npm run dev
npm test
```

## Output format
```markdown
Module: <name>
Created structure: <folders/files>
Installed stack: <deps>
Verification: <commands + result>
Next migration step: <first JET screen to port>
```

## Definition of done
- New React module runs locally.
- Test command executes successfully.
- Structure is ready for page-by-page JET migration.
