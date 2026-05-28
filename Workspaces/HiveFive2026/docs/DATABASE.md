# Base de datos

## Motor de trabajo

- Runtime: MySQL
- Tests de integracion: H2 (perfil `test`)

## Tablas funcionales

- `user`
- `board`
- `card`
- `role`
- `status`
- `checklist_item`
- `user_board`

## Convenciones de mapeo

- Nombres de tabla en singular.
- Columnas en `snake_case`.
- Entidades JPA por modulo, p. ej. `backend/hivefive-user/src/main/java/com/hivefive/user/domain`.
- DTOs de respuesta agrupados por entidad (`User`, `Board`, `Card`, etc.).

## Relaciones relevantes

- `card.board_id -> board.id`
- `card.status_id -> status.id`
- `card.user_id -> user.id` (admite null)
- `checklist_item.card_id -> card.id`
- `user_board.user_id -> user.id`
- `user_board.board_id -> board.id`

## Relacion con frontend

- El frontend React consume los datos a traves de servicios que normalizan payloads del backend.
- En algunos dominios el frontend contempla compatibilidad entre variantes `camelCase` y `snake_case`.

## Configuracion de conexion

Archivo principal:

- `backend/hivefive-api-app/src/main/resources/application.yml`

Archivo de tests H2:

- `backend/hivefive-api-app/src/test/resources/application-test.yml`

Archivo de tests RealDB:

- `backend/hivefive-api-app/src/test/resources/application-realdb.yml`
