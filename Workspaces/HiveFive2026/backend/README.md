# Backend HiveFive (Maven multi-modulo)

Parent POM: `backend/pom.xml` (`hivefive-backend`).

## Modulos

| Modulo | Rol |
| --- | --- |
| `hivefive-common` | Excepciones y DTOs transversales (`ErrorResponse`) |
| `hivefive-role` | Bounded context Role |
| `hivefive-status` | Bounded context Status |
| `hivefive-user` | Bounded context User |
| `hivefive-board` | Bounded context Board |
| `hivefive-card` | Bounded context Card |
| `hivefive-checklist` | Bounded context ChecklistItem |
| `hivefive-userboard` | Bounded context UserBoard |
| `hivefive-api-app` | Aplicacion ejecutable Spring Boot (REST, config, tests) |

## Comandos (desde la raiz del repo)

```bash
# Tests de todos los modulos
mvn -f backend/pom.xml test

# Arrancar API (multi-modulo: instalar dependencias internas y luego ejecutar)
mvn -f backend/pom.xml install -pl hivefive-api-app -am -DskipTests
mvn -f backend/pom.xml -pl hivefive-api-app spring-boot:run

# Tests solo del modulo app (mismos tests de integracion)
mvn -f backend/pom.xml -pl hivefive-api-app test
```

El primer `install -am` compila e instala `hivefive-api-app` y todos los modulos de los que depende (`hivefive-common`, `hivefive-user`, etc.) en el repositorio local de Maven. Sin ese paso, `spring-boot:run` con `-pl hivefive-api-app` solo falla al resolver esos artefactos internos.

Tras el primer `install`, puedes usar solo la segunda linea mientras no cambies codigo en modulos hermanos. Base URL: `http://localhost:8080/api/v1`

## Documentacion

- `hivefive-api-app/TESTING.md` — perfiles H2 / RealDB y JaCoCo
- `../docs/BACKEND.md` — API, seguridad y estructura
- `../docs/DATABASE.md` — esquema MySQL
