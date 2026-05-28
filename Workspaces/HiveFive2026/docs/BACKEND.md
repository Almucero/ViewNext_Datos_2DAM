# Backend (Spring Boot)

## Ubicacion

- Parent Maven: `backend/pom.xml`
- Modulo ejecutable: `backend/hivefive-api-app`
- Modulos de dominio: `backend/hivefive-{role,status,user,board,card,checklist,userboard}`
- Kernel compartido: `backend/hivefive-common`

Indice rapido de modulos: `backend/README.md`.

## Stack

- Java 17
- Spring Boot 3.2.x
- Spring Web (REST), Spring Data JPA
- Maven (multi-modulo)
- MySQL (runtime real)
- H2 (tests de integracion)

**Nota:** No se incluye `spring-boot-starter-security`. El modelo de seguridad actual es deliberadamente minimo; ver seccion [Seguridad](#seguridad).

## Estructura multi-modulo

Cada bounded context vive en su propio modulo Maven con paquete `com.hivefive.<context>`:

| Modulo | Paquetes tipicos |
| --- | --- |
| `hivefive-user` | `domain`, `repository`, `service`, `web.dto` |
| `hivefive-board` | idem |
| `hivefive-card` | idem |
| … | (role, status, checklist, userboard) |
| `hivefive-common` | `exception`, `dto` (`ErrorResponse`) |
| `hivefive-api-app` | arranque, `config`, controllers REST, `GlobalExceptionHandler`, `DomainOrchestrationService`, tests |

El modulo **app** no duplica entidades ni repositorios; solo expone HTTP y orquesta operaciones que cruzan varios contextos.

### Paquetes en `hivefive-api-app`

| Paquete | Contenido |
| --- | --- |
| `com.hivefive.api` | `HivefiveApiApplication` (`scanBasePackages = "com.hivefive"`) |
| `com.hivefive.api.config` | CORS, `AuthCompatibilityFilter`, `DataInitializer` (perfil `test`) |
| `com.hivefive.api.service` | `DomainOrchestrationService` (deleteUser, deleteBoard, deleteUserBoard) |
| `com.hivefive.api.web` | `*CompatibilityController`, `GlobalExceptionHandler` |

Los DTOs de API viven en cada modulo de dominio (ej. `com.hivefive.user.web.dto.UserDto`).

## API base

- `http://localhost:8080/api/v1`

## Dominios expuestos

- Users, Boards, Cards, Roles, Status, Checklist Items, User-Boards

## Endpoints base por dominio

Expuestos en controllers `*CompatibilityController` bajo `/api/v1` (rutas alineadas con `frontend/src/services`):

- `/users/get-all`, `/users/get/{id}`, `/users/create`, `/users/update`, `/users/delete/{id}`
- `/boards/get-all`, `/boards/get/{id}`, `/boards/create`, `/boards/update`, `/boards/delete/{id}`
- `/cards/get-all`, `/cards/get/{id}`, `/cards/create`, `/cards/update`, `/cards/delete/{id}`
- `/user-boards/get-all`, `/user-boards/create`, `/user-boards/delete`
- `/roles/get-all`, `/roles/get/{id}`, `/roles/create`, `/roles/update`, `/roles/delete/{id}`
- `/status/get-all`, `/status/get/{id}`, `/status/create`, `/status/update`, `/status/delete/{id}`
- `/checklist-items/get-all`, `/checklist-items/get/{id}`, `/checklist-items/create`, `/checklist-items/update`, `/checklist-items/delete/{id}`

## Coleccion Bruno (HTTP)

En `bruno/HiveFive-API` hay una coleccion [Bruno](https://www.usebruno.com/) con las peticiones del frontend. Guia en `bruno/HiveFive-API/README.md` y en el bloque `docs` de `collection.bru`.

## Convenciones de respuesta

- Respuestas por dominio en payload de lista (`User`, `Board`, `Card`, etc.).
- Errores en formato estandar: `codigo`, `mensaje` (`com.hivefive.common.dto.ErrorResponse`).

## Seguridad

### Estado actual

1. **Sin autenticacion ni autorizacion HTTP**  
   Ningun endpoint exige usuario contrastado (JWT, sesion, Basic, etc.).

2. **CORS (`CorsConfig`)**  
   Origenes: `http://localhost:8000`, `5173`, `5174`. Metodos: GET, POST, PUT, DELETE, OPTIONS.

3. **`AuthCompatibilityFilter`**  
   Unico rechazo explicito: `Authorization: Bearer INVALID` → 401 JSON (tests).

4. **Validacion en servicios de dominio (`*Service`)**  
   Campos obligatorios y reglas basicas; `IllegalArgumentException` → 400.

5. **`UnauthorizedException` y `GlobalExceptionHandler`**  
   Mapeo preparado para 401; el flujo principal no la lanza hoy.

6. **Datos sensibles**  
   Los DTO de usuario pueden incluir contraseña en respuestas. Riesgo conocido.

### Perfil `test` y datos iniciales

- `DataInitializer` (`@Profile("test")`) crea roles y usuario de prueba en H2.

## Ejecucion local

Desde la raiz del repositorio:

```bash
mvn -f backend/pom.xml -pl hivefive-api-app spring-boot:run
```

O desde el modulo app:

```bash
cd backend/hivefive-api-app
mvn spring-boot:run
```

## Pruebas

Desde la raiz del repositorio:

```bash
# Suite H2 (todos los modulos)
mvn -f backend/pom.xml test

# Solo RealDB
mvn -f backend/pom.xml -pl hivefive-api-app -DrunRealDbTests=true -Dtest="*RealDbIntegrationTest" test
```

Detalle: `backend/hivefive-api-app/TESTING.md`

## JaCoCo

Tras `mvn -f backend/pom.xml test`, el informe HTML del modulo app esta en:

- `backend/hivefive-api-app/target/site/jacoco/index.html`

La configuracion del plugin JaCoCo vive en `hivefive-api-app/pom.xml` (fase `test`).

## Documentacion en codigo

Javadoc con seccion **Seguridad** en servicios, config y manejo de excepciones. Cada `*CompatibilityController` expone una ruta por operacion alineada con el cliente React.
