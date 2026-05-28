---
name: springboot-migration-bootstrap
description: Bootstraps a Spring Boot backend project for migration work in HiveFive-style repositories. Use when the user asks to initialize a new Spring Boot module, create base folders/packages, and prepare configuration, profiles, and starter structure before migrating SOA/OSB logic.
disable-model-invocation: true
---

# Spring Boot Migration Bootstrap

## Goal
Create a ready-to-migrate Spring Boot baseline quickly and consistently.

## Use this skill when
- User asks to start a new backend module for migration.
- User asks for "inicializar proyecto Spring Boot".
- A legacy middleware component needs a new Spring target skeleton.

## Default stack baseline
- Java 17
- Maven
- Spring Boot 3.x
- Spring Web
- Spring Data JPA
- MySQL runtime + H2 tests

## Bootstrap workflow
1. Confirm target module path (example: `backend/<new-module>`).
2. Initialize project (Spring Initializr or equivalent Maven scaffold) with required dependencies.
3. Create package baseline:
   - `config`
   - `domain`
   - `repository`
   - `service`
   - `web`
   - `web/dto`
4. Create config baseline:
   - `application.yml`
   - `application-test.yml`
   - `application-realdb.yml` (if requested)
5. Add minimal app entrypoint and health-check endpoint.
6. Add first integration test structure under `src/test/java`.
7. Verify startup and tests run.

## Migration-ready conventions (important)
- Keep DB table mappings explicit with `@Table(name="...")`.
- Keep schema mutation disabled in runtime (`ddl-auto: none`) for migrated environments.
- Keep profile split clear:
  - test lane (H2)
  - real DB lane (project DB).
- Add CORS config for local frontend origins only when needed.

## Suggested commands
```bash
# from repo root (example path)
mkdir -p backend/new-api
# initialize Spring Boot project in backend/new-api
# then:
cd backend/new-api
mvn test
mvn spring-boot:run
```

## Output format
```markdown
Module: <name>
Created structure: <folders/files>
Config lanes: <test/realdb summary>
Verification: <commands + result>
Next migration step: <first component to port>
```

## Definition of done
- New Spring Boot module compiles and starts.
- Test lane is runnable.
- Folder/package structure is ready for incremental migration.
