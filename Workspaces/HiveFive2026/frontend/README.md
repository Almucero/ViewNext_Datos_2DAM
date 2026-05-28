# Frontend HiveFive2026

Aplicacion web principal de HiveFive2026 construida con React + TypeScript + Vite.

## Requisitos

- Node.js 20+ recomendado (18+ compatible)
- npm

## Arranque en local

```bash
npm install
npm run dev
```

Servidor de desarrollo:

- `http://localhost:5173`

## Scripts disponibles

- `npm run dev` - Ejecuta Vite en modo desarrollo.
- `npm run build` - Compila TypeScript y genera build de produccion.
- `npm run preview` - Sirve localmente la build de produccion.
- `npm run lint` - Ejecuta ESLint.
- `npm test` - Ejecuta test suite con Vitest.
- `npm run test:watch` - Ejecuta tests en modo watch.

## Estructura

```text
frontend/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── test/
│   ├── App.tsx
│   ├── i18n.tsx
│   ├── index.css
│   └── main.tsx
├── web/                 # Modulo legacy Oracle JET (no flujo principal)
├── package.json
└── vite.config.ts
```

## Funcionalidades clave

- Login y registro.
- Dashboard con gestion de tableros.
- Vista Kanban de tarjetas.
- Prioridad de tarjetas 1..9 con codificacion visual por nivel.
- Subtareas por tarjeta.
- Gestion de usuarios en tablero (agregar, quitar y salir del tablero sin eliminarlo).
- Internacionalizacion ES/EN con persistencia.

## Documentacion relacionada

- `../README.md`
- `../docs/FRONTEND.md`
- `../docs/SETUP.md`
