# HiveFive2026

Aplicacion web para gestion de tableros, tarjetas y subtareas.

## Estado actual del repositorio

El proyecto contiene dos capas activas:

- `backend/hivefive-api-app`: API REST con Spring Boot (parent Maven: `backend/pom.xml`).
- `frontend`: SPA en React + TypeScript + Vite.

Adicionalmente, dentro de `frontend/web` existe codigo Oracle JET heredado que se conserva por compatibilidad y referencia historica.

## Estructura

```text
HiveFive2026/
├── backend/
│   ├── pom.xml                        # Parent Maven multi-modulo
│   └── hivefive-api-app/              # API Spring Boot (Java 17, Maven)
├── frontend/                          # App React + TypeScript + Vite
│   ├── src/                           # Codigo fuente principal
│   └── web/                           # Modulo legacy Oracle JET
├── docs/                              # Documentacion funcional y tecnica
└── README.md
```

## Funcionalidades principales

- Autenticacion (login y registro).
- Dashboard de tableros por usuario.
- Vista Kanban por estados.
- CRUD de tarjetas.
- Prioridad de tarjeta en rango 1..9 con codificacion visual progresiva (rojo a verde).
- Subtareas por tarjeta (checklist).
- Gestion de miembros en tablero (agregar, quitar y salir del tablero sin eliminarlo).
- Selector de idioma ES/EN con persistencia local.

## Requisitos

- Java 17
- Maven 3.9+
- Node.js 20+ recomendado (18+ compatible)
- npm

## Arranque rapido

### 1) Backend

```bash
mvn -f backend/pom.xml -pl hivefive-api-app spring-boot:run
```

API base:

- `http://localhost:8080/api` (prefijo)
- `http://localhost:8080/api/v1` (endpoints funcionales)

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplicacion web (Vite):

- `http://localhost:5173`

## Testing

### Backend

```bash
mvn -f backend/pom.xml test
```

Tests contra base real:

```bash
mvn -f backend/pom.xml -pl hivefive-api-app -DrunRealDbTests=true -Dtest="*RealDbIntegrationTest" test
```

### Frontend (React)

```bash
cd frontend
npm run build
npm test
```

## Documentacion

- `bruno/HiveFive-API`: coleccion [Bruno](https://www.usebruno.com/) alineada con las rutas del frontend (`/api/v1`). Uso en la pestaña **Overview** de la coleccion y en `bruno/HiveFive-API/README.md`.
- `docs/README.md`: indice de documentacion.
- `docs/SETUP.md`: instalacion local paso a paso.
- `docs/ARCHITECTURE.md`: arquitectura y flujo de datos.
- `docs/FRONTEND.md`: frontend React, i18n y testing.
- `docs/BACKEND.md`: backend Spring Boot y dominios.
- `docs/DATABASE.md`: entidades y relaciones de datos.

## Guia de migracion con skills (orden recomendado)

Esta guia define el orden para migrar proyectos legacy a Spring Boot y React usando las skills de `.cursor/skills`.

### Regla base

1. Primero, analizar en detalle el proyecto legacy a migrar.
2. Despues, en otro prompt, ejecutar la skill de bootstrap correspondiente.
3. Continuar por fases con skills de migracion.
4. Cerrar con skill de testing.

Si se parte desde cero, comenzar por **Spring Boot**.

### Flujo Spring Boot (separado)

No mezclar este flujo con React en la misma ejecucion.

1. **Lectura y mapeo del componente**
   - Skill: `migration-discovery-hivefive`
2. **Inicializacion del backend de migracion (si aplica)**
   - Skill: `springboot-migration-bootstrap`
3. **Migracion de componente SOA/OSB a Spring Boot**
   - Skill: `soa-osb-component-to-springboot`
4. **Validacion de paridad de contrato**
   - Skill: `soa-osb-contract-parity-tests`
5. **Ejecucion de tests backend (H2 y RealDB por separado)**
   - Skill: `fullstack-testing-hivefive`

### Flujo React (separado)

No mezclar este flujo con Spring Boot en la misma ejecucion.

1. **Lectura del modulo legacy (JET) y mapeo a React**
   - Skill: `migration-discovery-hivefive`
2. **Inicializacion del frontend de migracion (si aplica)**
   - Skill: `react-migration-bootstrap`
3. **Migracion de pantalla ViewModel+HTML a React**
   - Skill: `jet-viewmodel-to-react-screen`
4. **Refactor de arquitectura UI/hook/service**
   - Skill: `react-hook-page-splitter`
5. **Construccion/normalizacion de servicios de compatibilidad**
   - Skill: `react-compatibility-service-builder`
6. **Cierre de i18n y UX**
   - Skill: `react-i18n-ux-parity-migration`
7. **Ejecucion de tests frontend (JET o React segun fase)**
   - Skill: `fullstack-testing-hivefive`

### Orquestacion opcional

Para migraciones completas por componente (end-to-end), se puede usar:

- Skill: `component-migration-orchestrator`

como coordinador de fases, manteniendo siempre la separacion Spring Boot / React.
