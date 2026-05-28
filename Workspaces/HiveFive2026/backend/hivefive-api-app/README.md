# hivefive-api-app

Modulo ejecutable Spring Boot del backend HiveFive (multi-modulo Maven).

## Arranque

Desde la raiz del repo:

```bash
mvn -f backend/pom.xml install -pl hivefive-api-app -am -DskipTests
mvn -f backend/pom.xml -pl hivefive-api-app spring-boot:run
```

Desde este directorio (requiere `install` previo del parent; ver `../README.md`):

```bash
mvn spring-boot:run
```

Base URL: `http://localhost:8080/api/v1`

## Pruebas

```bash
mvn -f backend/pom.xml -pl hivefive-api-app test
mvn -f backend/pom.xml -pl hivefive-api-app -DrunRealDbTests=true -Dtest="*RealDbIntegrationTest" test
```

Ver `TESTING.md` (JaCoCo, perfiles H2/RealDB).

## Estructura (solo este modulo)

- `com.hivefive.api` — `HivefiveApiApplication`
- `com.hivefive.api.config` — CORS, filtros, seed perfil `test`
- `com.hivefive.api.service` — `DomainOrchestrationService`
- `com.hivefive.api.web` — `*CompatibilityController`, `GlobalExceptionHandler`

Dominio (entidades, repos, `*Service`, DTOs): modulos hermanos `../hivefive-*`.

## Documentacion

- `TESTING.md`
- `../../docs/BACKEND.md`
- `../README.md`
