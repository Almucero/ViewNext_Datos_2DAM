---
name: springboot-modular-migration
description: Refactors HiveFive monolithic Spring Boot backend (backend/hivefive-api) into a Maven multi-module layout with shared kernel and per-domain modules. Use when the user asks to modularize Spring Boot, split by modules, multi-module Maven, bounded contexts, or migrate to a modular Spring Boot template.
disable-model-invocation: true
---

# Spring Boot Modular Migration (HiveFive)

## Goal

Convert `backend/hivefive-api` (single JAR, layered packages) into a **Maven multi-module** backend while preserving:

- `/api/v1` compatibility contracts (React + legacy clients)
- MySQL/JPA rules from `AGENTS.md` and `.cursor/rules/springboot-jpa-mysql.mdc`
- Test lanes: H2 (`application-test.yml`) and real DB (`application-realdb.yml`)

## Use this skill when

- User asks to modularize, split by modules, or use a modular Spring Boot template.
- User wants `backend/pom.xml` parent + child modules instead of one `pom.xml`.
- User wants bounded-context modules (`user`, `board`, `card`, etc.).

## Related skills

- New greenfield module: [springboot-migration-bootstrap](../springboot-migration-bootstrap/SKILL.md)
- Migrate one SOA component into existing API: [soa-osb-component-to-springboot](../soa-osb-component-to-springboot/SKILL.md)
- Detailed POM/package templates: [reference.md](reference.md)

## Target layout (end state)

```
backend/
  pom.xml                          # packaging=pom, dependencyManagement
  hivefive-common/                 # shared kernel (no Spring Boot plugin)
  hivefive-user/                   # user bounded context
  hivefive-board/
  hivefive-card/
  hivefive-status/
  hivefive-role/
  hivefive-checklist/
  hivefive-userboard/
  hivefive-api-app/                # runnable Boot app (replaces hivefive-api)
```

Each **feature module** owns: `domain`, `repository`, `service`, `web/dto` for that entity.  
**App module** owns: `HivefiveApiApplication`, `config/*`, `GlobalExceptionHandler`, `*CompatibilityController`, `DomainOrchestrationService`, `application*.yml`, integration tests.

Package base: `com.hivefive.<module>` (example: `com.hivefive.user.domain.UserEntity`).

## Non-negotiable rules (do not break during refactor)

- `@Table(name = "...")` exact singular names; escape `` `user` `` in native SQL.
- `spring.jpa.hibernate.ddl-auto: none` and schema-generation `none`.
- `hibernate.globally_quoted_identifiers: true`.
- CORS origins: `5173`, `5174`, `8000`.
- Local run targets real MySQL (no docker-compose default flow).
- No API path or wrapper key changes unless user explicitly requests a breaking change.

## Incremental workflow (required order)

Migrate in **small PR-sized steps**. Never big-bang move all packages in one step.

### Phase 0 — Parent POM without behavior change

```
Task progress:
- [ ] Create backend/pom.xml (packaging pom, modules list)
- [ ] Rename/move hivefive-api → hivefive-api-app as child module (artifactId hivefive-api-app)
- [ ] Child keeps same main class and dependencies
- [ ] mvn -f backend/pom.xml test passes
- [ ] mvn -f backend/hivefive-api-app spring-boot:run still works
```

### Phase 1 — Extract `hivefive-common`

Move only **cross-cutting, low-coupling** types:

- `service/NotFoundException`, `service/UnauthorizedException`
- `web/dto/ErrorResponse`
- Optional: shared validation helpers (no JPA entities here)

`hivefive-common` is a plain JAR (`packaging jar`), **no** `spring-boot-maven-plugin`.  
Feature modules and app depend on `hivefive-common`.

### Phase 2 — Pilot one feature module (template)

Pick **one** bounded context with few cross-entity calls (prefer `role` or `status` over `card`).

Per module checklist:

```
- [ ] Create hivefive-<name>/pom.xml (depends on common + spring-boot-starter-data-jpa)
- [ ] Move Entity, Repository, service methods, DTOs for that context
- [ ] Expose a @Service bean with a narrow public API (no web layer in feature module initially)
- [ ] App module: CompatibilityService delegates to new service
- [ ] H2 + realdb tests for that CRUD still pass
```

Document the pilot as the pattern for remaining modules in [reference.md](reference.md).

### Phase 3 — Remaining feature modules

Repeat Phase 2 one module at a time. Suggested order (dependencies first):

1. `role`, `status`
2. `user`
3. `board`
4. `card`, `checklist`
5. `userboard` (composite key; do last)

After each module: run full `mvn -f backend/pom.xml test`.

### Phase 4 — Thin app & optional controller split

- Shrink `CompatibilityService` until removed; controller calls feature services directly.
- Optionally split `CompatibilityController` into per-module `@RestController` classes under `hivefive-api-app`, **keeping exact** `/api/v1/...` paths.
- Keep `GlobalExceptionHandler` and `config/*` in app module only.

### Phase 5 — Cleanup

- Remove empty packages from app module.
- Update docs (`docs/BACKEND.md`, `TESTING.md`) with new paths and `mvn -f backend/pom.xml` commands.
- Confirm JaCoCo still runs from parent or app module (pick one, document it).

## Maven conventions

| Module | packaging | spring-boot-maven-plugin | Depends on |
|--------|-----------|--------------------------|------------|
| Parent `backend` | pom | no | — |
| `hivefive-common` | jar | no | — |
| `hivefive-*` feature | jar | no | common, jpa (api scope where possible) |
| `hivefive-api-app` | jar | **yes** (repackage) | all feature modules + web |

- Parent manages `spring-boot-starter-parent` and `${project.version}` alignment.
- Use `<dependencyManagement>` in parent for internal modules (`com.hivefive:hivefive-common`, etc.).
- Feature modules must **not** be executable JARs.

## Spring configuration

In `HivefiveApiApplication`:

```java
@SpringBootApplication(scanBasePackages = "com.hivefive")
```

Ensure each feature module registers components under `com.hivefive.<feature>`.

JPA: enable entity/repository scan for all feature packages:

```java
@EntityScan(basePackages = "com.hivefive")
@EnableJpaRepositories(basePackages = "com.hivefive")
```

Place these on the **app** main class only (not in feature modules).

## Dependency rules between modules

```
hivefive-api-app  →  all feature modules, hivefive-common
hivefive-<feature>  →  hivefive-common only (avoid feature-to-feature deps)
hivefive-common  →  minimal (no spring-web, no jpa)
```

If feature A needs feature B data:

- Prefer orchestration in **app module** (inject both services), not a direct Maven dependency A→B.
- If unavoidable, extract shared read-only contracts to `hivefive-common` (interfaces/DTOs only).

## Verification after every phase

```bash
cd backend
mvn test
mvn -pl hivefive-api-app spring-boot:run
```

Manual smoke (if DB available): one GET and one mutating call per migrated entity on `/api/v1`.

## Output format

```markdown
## Modular migration step: <phase/module>

**Changed modules:** <list>
**Moved packages:** <from → to>
**API impact:** none | <describe if breaking>
**Commands run:** <mvn ...>
**Test result:** <pass/fail summary>
**Next step:** <phase N+1>
```

## Definition of done (full migration)

- [ ] `backend/pom.xml` aggregates all modules; CI/build docs use parent POM.
- [ ] Runnable app is `hivefive-api-app` only.
- [ ] Each bounded context lives in its own module with clear package boundary.
- [ ] `CompatibilityController` paths and wrapper keys unchanged.
- [ ] H2 and realdb integration tests pass from parent build.
- [ ] No runtime DDL or table naming regressions.

## Anti-patterns

- Moving all entities/repos in one commit without tests green in between.
- Circular Maven dependencies between feature modules.
- Duplicate `@SpringBootApplication` in feature modules.
- Putting `application.yml` in every module (keep profiles centralized in app).
- Renaming `/api/v1` routes or DTO wrapper keys during structural refactor.
- Enabling `ddl-auto: update/create` in any profile.
