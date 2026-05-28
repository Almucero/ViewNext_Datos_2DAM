# Documentación de la Carpeta `.cursor` y Skills del Proyecto HiveFive

## Propósito General
La carpeta `.cursor` funciona como el **cerebro normativo y operativo** para los agentes de inteligencia artificial que trabajan en este repositorio. Su contenido, principalmente organizado dentro de la subcarpeta `skills/`, contiene un conjunto de herramientas documentadas o "Habilidades" (Skills) que le enseñan al asistente cómo abordar tareas altamente especializadas.

El objetivo principal de estas Skills es **estandarizar y automatizar de forma segura** el complejo proceso de migración de la arquitectura antigua (Oracle JET, Knockout.js, y middleware SOA/OSB) a la arquitectura moderna (React, Vite, TypeScript y Spring Boot). Al usar estas Skills, se garantiza que el código generado por IA siga estrictamente las arquitecturas limpias, las convenciones de compatibilidad y los requerimientos de negocio de HiveFive.

---

## Catálogo de Skills: Función, Uso y Casos de Uso

A continuación se detalla cada una de las Skills disponibles, explicando su función, cómo debe invocarse/usarse y ejemplos de en qué situaciones se aplican.

### 1. component-migration-orchestrator
- **Función:** Actúa como el "director de orquesta" para migraciones de ciclo completo. Se encarga de planificar y coordinar la migración *end-to-end* (de principio a fin) de un componente funcional pasando por todas sus capas: middleware, backend Spring Boot y frontend React.
- **Cómo se usa:** Se invoca cuando se quiere mover toda una funcionalidad antigua al nuevo ecosistema. El agente utilizará esta skill para generar un plan de fases paso a paso antes de empezar a programar.
- **Casos de Uso:** Migrar el módulo completo de "Tarjetas" (Cards) o "Tableros" (Boards) asegurando que no queden hilos sueltos entre la capa visual y la base de datos.

### 2. migration-discovery-hivefive
- **Función:** Herramienta de análisis e investigación. Rastrea y mapea la equivalencia entre archivos heredados (archivos de middleware, ViewModels de JET) y los futuros o actuales archivos modernos (endpoints en Spring Boot, componentes de React).
- **Cómo se usa:** Se utiliza al inicio de un proceso de migración. El usuario le pide al agente que analice el impacto de migrar un módulo. El agente mapea las dependencias para evitar romper funcionalidades.
- **Casos de Uso:** Analizar cuántas dependencias tiene el archivo `CardViewModel.js` heredado y qué servicios web de OSB invoca antes de decidir cómo construir el equivalente en React.

### 3. soa-osb-component-to-springboot
- **Función:** Especializada en la capa de Backend. Traduce y migra la lógica de negocio y las operaciones CRUD desde los antiguos componentes de middleware SOA/OSB hacia la nueva arquitectura de Spring Boot. Mantiene contratos de compatibilidad estrictos.
- **Cómo se usa:** Se aplica apuntando a un componente SOA/OSB específico y solicitando su conversión a controladores, servicios y repositorios de Spring Boot.
- **Casos de Uso:** Traducir una operación BPEL o OSB que lee de base de datos y la expone en XML hacia un endpoint REST en Java (Spring Boot) con JPA.

### 4. soa-osb-contract-parity-tests
- **Función:** Genera y verifica pruebas de integración que aseguran que el nuevo código de Spring Boot responda **exactamente igual** (a nivel de contrato y estructura de datos) que la implementación original de SOA/OSB.
- **Cómo se usa:** Se invoca después de migrar un componente al backend o durante integraciones continuas, para correr pruebas de compatibilidad de *payloads*.
- **Casos de Uso:** Validar que una respuesta JSON o XML del nuevo servidor Spring Boot no rompa la estructura de datos que esperaba el sistema heredado, previniendo regresiones críticas.

### 5. soa-test-generator
- **Función:** Automatiza la creación, modificación y **resolución de errores** de casos de prueba XML para composites de SOA. Utiliza como **fuente de verdad el archivo XML por defecto** generado por JDeveloper para emular la estructura correcta.
- **Cómo se usa:** **Requiere la creación manual de la Test Suite.** Tras generar la test suite en JDeveloper, el usuario pide a la IA que corrija el archivo *por defecto* o que cree nuevos tests basándose en él (añadiéndolos a `fileList.xml`). Además, **si un test falla (algo muy común), el usuario pasará los logs de error** y la IA se encargará de interpretarlos y ajustar el XML para que el test pase exitosamente.
- **Reglas de Datos:** El agente **nunca modificará los nombres de los atributos de la base de datos**, sino que adaptará sus valores. Utilizará IDs altas para evitar solapes (excepto en Foreign Keys, donde utilizará IDs existentes).
- **Casos de Uso:** Modificar un test XML autogenerado, crear múltiples variaciones de tests (ej. "fallo por ID nulo", "éxito") basándose en la plantilla, y resolver errores de ejecución interpretando logs de JDeveloper.

### 6. springboot-migration-bootstrap
- **Función:** Inicializa la estructura fundacional de un backend moderno.
- **Cómo se usa:** Se ejecuta cuando no existe un proyecto backend o se requiere inicializar un nuevo módulo en Spring Boot. El agente creará la jerarquía de paquetes, configuraciones base (application.yml) y las clases de inicialización.
- **Casos de Uso:** Crear desde cero la estructura base `com.hivefive.api...` con sus perfiles de desarrollo y producción, antes de empezar a inyectar entidades o controladores.

### 7. jet-viewmodel-to-react-screen
- **Función:** Herramienta directa de conversión de UI. Traduce la lógica antigua (Knockout.js / ViewModels de Oracle JET) y la vista HTML a una pantalla de React moderna.
- **Cómo se usa:** El usuario selecciona un ViewModel heredado y pide su migración. El agente convertirá observables en estados y efectos de React.
- **Casos de Uso:** Convertir `dashboard.js` y `dashboard.html` del frontend heredado en un archivo `Dashboard.tsx` usando componentes funcionales de React.

### 8. react-migration-bootstrap
- **Función:** Inicializa el entorno Frontend moderno con Vite, TypeScript y React.
- **Cómo se usa:** De forma análoga al *bootstrap* de backend, se usa cuando se va a iniciar el ecosistema moderno de UI. Establece rutas, proveedores de contexto e i18n inicial.
- **Casos de Uso:** Crear la estructura base `src/pages`, `src/hooks`, y `src/services` en un repositorio frontend vacío.

### 9. react-hook-page-splitter
- **Función:** Estandariza la arquitectura del código React asegurando la separación de responsabilidades (Clean Architecture en el frontend).
- **Cómo se usa:** Se aplica sobre componentes React que se han vuelto demasiado complejos (ej. monolitos visuales). El agente separa el archivo en 3 capas: Vista (TSX), Lógica de Estado (Custom Hook) y Consumo de Datos (Service).
- **Casos de Uso:** Refactorizar un `BoardList.tsx` de 500 líneas en: `BoardList.tsx` (sólo UI), `useBoardList.ts` (efectos y estado) y `boardService.ts` (Axios).

### 10. react-compatibility-service-builder
- **Función:** Genera la capa de red del frontend. Crea servicios de Axios orientados a conectarse con el backend de compatibilidad de Spring Boot.
- **Cómo se usa:** Se utiliza cuando se necesita conectar una pantalla de React con una API, asegurando que tolere formatos heredados (como variaciones de nombres `snake_case` o contenedores de *arrays* extraños).
- **Casos de Uso:** Escribir el `apiService.ts` para capturar la respuesta del servidor legacy y normalizarla para que el Frontend la entienda fácilmente.

### 11. react-i18n-ux-parity-migration
- **Función:** Asegura que el frontend migrado tenga el mismo nivel de accesibilidad, internacionalización (i18n) y pulido de Experiencia de Usuario (UX) que el original, o mejor.
- **Cómo se usa:** Se pasa como regla de revisión o pulido sobre una pantalla de React para extraer cadenas de texto quemadas, unificar indicadores de carga (spinners) y estandarizar alertas de error.
- **Casos de Uso:** Revisar una vista ya migrada para reemplazar textos como `"Guardar cambios"` por llamadas a traducciones como `t('button.save')` y asegurar que la interfaz reaccione bien a estados vacíos o errores de red.

### 12. fullstack-testing-hivefive
- **Función:** Centraliza la ejecución y mantenimiento de pruebas en todo el ecosistema mixto.
- **Cómo se usa:** Se le pide al agente que ejecute o genere suites de pruebas tanto para React (usando herramientas como Jest/Vitest) como para Spring Boot (usando bases de datos en memoria H2 o integraciones reales).
- **Casos de Uso:** Asegurar cobertura total (*Full Test Coverage*) escribiendo tests unitarios para un custom hook en React y a la par, tests de integración para el servicio JPA de Spring Boot.
