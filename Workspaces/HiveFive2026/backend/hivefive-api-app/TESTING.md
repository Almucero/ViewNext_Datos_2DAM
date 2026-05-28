# Testing Spring Boot (HiveFive API)

## Objetivo

Bateria de tests del modulo ejecutable `hivefive-api-app` (contexto Spring completo con todos los modulos de dominio en classpath).

## Comandos Maven (recomendado desde la raiz del repo)

```bash
# Todos los modulos + tests de integracion en hivefive-api-app
mvn -f backend/pom.xml test

# Solo el modulo app (equivalente para tests)
mvn -f backend/pom.xml -pl hivefive-api-app test

# RealDB (opcional)
mvn -f backend/pom.xml -pl hivefive-api-app -DrunRealDbTests=true -Dtest="*RealDbIntegrationTest" test
```

Desde este directorio (`backend/hivefive-api-app`) tambien puedes usar `mvn test` si el parent ya esta instalado en el reactor local.

## JaCoCo

- Plugin configurado en `pom.xml` de este modulo.
- Se ejecuta en la fase `test` del build (`mvn -f backend/pom.xml test`).
- Informe HTML: `target/site/jacoco/index.html`
- Resumen en consola al final de la fase test (script Groovy en el POM).

## Seguridad en tests

`ErrorHandlingIntegrationTest` usa `Authorization: Bearer INVALID` para el 401 de `AuthCompatibilityFilter`. Modelo de seguridad: `docs/BACKEND.md`.

## Perfil `test` y esquema H2

`application.yml` principal fija `jakarta.persistence.schema-generation.database.action: none`. `application-test.yml` lo sobrescribe a `create` para que H2 tenga tablas antes de `DataInitializer`.

## Estructura de tests

- `src/test/java/com/hivefive/api/tests/h2` — integracion con H2 (perfil `test`)
- `src/test/java/com/hivefive/api/tests/realdb` — integracion MySQL (perfil `realdb`, flag `-DrunRealDbTests=true`)

Configuracion:

- `src/test/resources/application-test.yml`
- `src/test/resources/application-realdb.yml`

## Bloque H2

### Clases

- `UserCrudIntegrationTest`, `BoardCrudIntegrationTest`, `CardCrudIntegrationTest`
- `RoleCrudIntegrationTest`, `StatusCrudIntegrationTest`, `ChecklistItemCrudIntegrationTest`
- `UserBoardCrudIntegrationTest`, `ErrorHandlingIntegrationTest`

### Ejecucion

```bash
mvn -f backend/pom.xml -pl hivefive-api-app test
```

Por clase:

```bash
mvn -f backend/pom.xml -pl hivefive-api-app -Dtest=UserCrudIntegrationTest test
```

## Bloque RealDB

Activacion: `-DrunRealDbTests=true`

```bash
mvn -f backend/pom.xml -pl hivefive-api-app -DrunRealDbTests=true -Dtest="*RealDbIntegrationTest" test
```

## Arranque manual para pruebas HTTP

```bash
mvn -f backend/pom.xml -pl hivefive-api-app spring-boot:run
```

Base: `http://localhost:8080/api/v1`
