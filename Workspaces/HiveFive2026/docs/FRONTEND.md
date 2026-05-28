# Frontend

## Ubicacion

- `frontend`

## Stack actual

- React 19
- TypeScript
- Vite
- React Router
- Axios
- Vitest + Testing Library

## Estructura principal

- `src/main.tsx`
  - Punto de entrada y providers globales.
- `src/App.tsx`
  - Ruteo de la aplicacion.
- `src/pages`
  - Pantallas (`Login`, `Register`, `Dashboard`, `BoardDetail`).
- `src/components`
  - Componentes reutilizables (`KanbanCard`, `LanguageSwitcher`).
- `src/hooks`
  - Logica de UI encapsulada (`useBoard`).
- `src/services`
  - Cliente funcional de API por dominio.
- `src/i18n.tsx`
  - Contexto de idioma ES/EN con persistencia.
- `src/index.css`
  - Estilos globales y layout.
- `src/test`
  - Setup comun de pruebas.

## Funcionalidad de UI

- Login con sugerencias de emails recientes.
- Toggle ver/ocultar contrasena.
- Registro de usuario.
- Dashboard con CRUD de boards.
- Vista Kanban para tarjetas por estado.
- Edicion/creacion de tarjeta con prioridad 1..9 y semantica visual por nivel.
- Subtareas (checklist) por tarjeta.
- Gestion de usuarios por tablero: agregar, quitar y opcion para salir del tablero actual sin borrarlo.
- Selector de idioma global ES/EN.

## Integracion con backend

Base de API configurada en:

- `http://localhost:8080/api` (prefijo del cliente Axios)
- `http://localhost:8080/api/v1` (rutas funcionales finales)

Servicios principales:

- `authService`
- `boardService`
- `cardService`
- `statusService`
- `checklistService`

## Ejecucion local

```bash
cd frontend
npm install
npm run dev
```

## Scripts

- `npm run dev`: arranque local en modo desarrollo.
- `npm run build`: build de produccion.
- `npm run lint`: analisis estatico.
- `npm test`: suite de tests con Vitest.
- `npm run test:watch`: tests en modo watch.

## Testing frontend

La suite cubre:

- Servicios de negocio (`auth`, `boards`, `cards`).
- Contexto de internacionalizacion (`i18n`).
- Componentes clave (`LanguageSwitcher`).
- Flujos de pagina (`Login`, `Dashboard`), incluyendo retraduccion de errores al cambiar idioma.

Comando:

```bash
npm test
```

## Nota sobre modulo legacy

El directorio `frontend/web` contiene implementaciones Oracle JET heredadas.
El flujo principal de producto se encuentra en `frontend/src`.
