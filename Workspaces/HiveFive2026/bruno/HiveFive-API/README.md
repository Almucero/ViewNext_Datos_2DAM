# HiveFive API — Bruno

Coleccion para probar la misma API REST que consume el frontend (`/api/v1`).

## Documentacion en Bruno

La guia principal esta en la propia coleccion: abre **HiveFive API** y en la pestaña **Overview** (markdown del bloque `docs` al final de `collection.bru`). Si ves el texto generico de Bruno, guarda `collection.bru` o vuelve a abrir la coleccion: antes el archivo tenia sintaxis invalida y Bruno ignoraba casi todo.

## Uso rapido

1. Arranca el backend: `mvn -f backend/pom.xml -pl hivefive-api-app spring-boot:run`.
2. En Bruno: **Open Collection** → carpeta `bruno/HiveFive-API`.
3. Selecciona el entorno **`local`** (arriba a la derecha) para que exista `baseUrl`.
4. Ajusta variables en **Collection → Vars** (en disco es el bloque `vars:pre-request` de `collection.bru`) si tus IDs no coinciden con los por defecto.

Las peticiones incluidas coinciden con las rutas usadas en `frontend/src/services/` (usuarios, tableros, tarjetas, enlaces usuario-tablero, estados de solo lectura, checklist).
Para `UserBoards`, el backend no expone un `get/{id}` dedicado: la request **Get user-board by ids (compat)** usa `get-all` para revisar un par `boardId/userId`.
