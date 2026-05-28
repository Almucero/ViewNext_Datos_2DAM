# Guia de Prompts para Skills de Migracion

Este documento define prompts listos para usar en chat con skills (invocadas con `/skill-name`) para ejecutar la migracion por fases.

Importante:
- Estos pasos son para ejecutarlos por prompts (no manualmente).
- Mantener separados los flujos de Spring Boot y React.
- Si se parte de 0, empezar por Spring Boot.

## Flujo Spring Boot (separado)

### 1) Analisis inicial (siempre primero)

```text
/migration-discovery-hivefive analiza en maximo detalle el componente [NOMBRE_COMPONENTE] del legacy (SOA/OSB) y dame:
- source artifacts
- target artifacts Spring Boot
- riesgos de paridad
- orden de ejecucion recomendado
No implementes todavia, solo analisis y mapa.
```

### 2) Bootstrap Spring Boot (si se parte de 0)

```text
/springboot-migration-bootstrap inicializa un proyecto Spring Boot para migracion en [RUTA_DESTINO], con estructura completa de paquetes, perfiles y configuracion base (test + realdb). Dame resultado con archivos creados y comandos de verificacion.
```

### 3) Migracion SOA/OSB -> Spring Boot

```text
/soa-osb-component-to-springboot migra el componente [NOMBRE_COMPONENTE] a Spring Boot manteniendo contrato de compatibilidad. Hazlo por operaciones (get-all, get/id, create, update, delete) y detalla endpoint, request/response, service, repository/entity y validaciones.
```

### 4) Paridad de contrato backend

```text
/soa-osb-contract-parity-tests crea/ajusta tests de paridad para [NOMBRE_COMPONENTE] comparando comportamiento legacy vs backend actual. Incluye happy path, validacion minima, not found y edge case.
```

### 5) Testing backend en 2 lanes

```text
/fullstack-testing-hivefive ejecuta tests de Spring Boot para [NOMBRE_COMPONENTE] en dos grupos separados:
1) Spring-H2
2) Spring-RealDB
Devuelveme comandos, resultado pass/fail, errores clave y next action.
```

## Flujo React (separado)

### 1) Analisis inicial (siempre primero)

```text
/migration-discovery-hivefive analiza en detalle el modulo JET [NOMBRE_MODULO] (ViewModel + HTML) y mapealo a React. Quiero estado, handlers, llamadas API, i18n, riesgos y plan por fases. No implementes todavia.
```

### 2) Bootstrap React (si se parte de 0)

```text
/react-migration-bootstrap inicializa proyecto React para migracion en [RUTA_DESTINO] con pages/components/hooks/services/config/test, i18n base, router y api client. Incluye verificacion de dev/build/test.
```

### 3) Migracion JET -> React

```text
/jet-viewmodel-to-react-screen migra el modulo [NOMBRE_MODULO] de JET a React en formato page + hook + service, manteniendo funcionalidad e integracion.
```

### 4) Separacion logica/UI

```text
/react-hook-page-splitter refactoriza [NOMBRE_PANTALLA] para separar UI de logica de dominio: estado/efectos/handlers en hook y pagina declarativa.
```

### 5) Servicios de compatibilidad

```text
/react-compatibility-service-builder crea o ajusta servicios para [NOMBRE_DOMINIO] consumiendo endpoints de compatibilidad y normalizando wrappers/campos legacy. Incluye tests de servicio.
```

### 6) Cierre i18n + UX

```text
/react-i18n-ux-parity-migration haz el pass final de [NOMBRE_PANTALLA] para eliminar strings hardcodeadas y completar estados UX (loading/error/empty/confirmaciones). Incluye claves i18n añadidas.
```

### 7) Testing frontend

```text
/fullstack-testing-hivefive ejecuta tests del frontend para el alcance migrado (JET y/o React segun fase) y dame resultado por stack con comandos, pass/fail y riesgos residuales.
```

## Orquestacion opcional

```text
/component-migration-orchestrator migra [NOMBRE_COMPONENTE] por fases, sin mezclar Spring Boot y React en la misma ejecucion. Primero discovery, luego bootstrap (si aplica), luego migracion, luego paridad y por ultimo testing.
```
