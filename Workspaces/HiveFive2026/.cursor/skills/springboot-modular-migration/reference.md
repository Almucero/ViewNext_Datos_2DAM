# Spring Boot Modular Migration — Reference

## Parent POM skeleton (`backend/pom.xml`)

```xml
<project>
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.5</version>
    <relativePath/>
  </parent>
  <groupId>com.hivefive</groupId>
  <artifactId>hivefive-backend</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  <packaging>pom</packaging>
  <modules>
    <module>hivefive-common</module>
    <module>hivefive-role</module>
    <!-- add modules incrementally -->
    <module>hivefive-api-app</module>
  </modules>
  <dependencyManagement>
    <dependencies>
      <dependency>
        <groupId>com.hivefive</groupId>
        <artifactId>hivefive-common</artifactId>
        <version>${project.version}</version>
      </dependency>
      <!-- repeat per internal module -->
    </dependencies>
  </dependencyManagement>
</project>
```

## Feature module POM (`hivefive-user/pom.xml`)

```xml
<project>
  <parent>
    <groupId>com.hivefive</groupId>
    <artifactId>hivefive-backend</artifactId>
    <version>0.0.1-SNAPSHOT</version>
  </parent>
  <artifactId>hivefive-user</artifactId>
  <dependencies>
    <dependency>
      <groupId>com.hivefive</groupId>
      <artifactId>hivefive-common</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
  </dependencies>
</project>
```

## App module POM (`hivefive-api-app/pom.xml`)

```xml
<dependencies>
  <dependency>
    <groupId>com.hivefive</groupId>
    <artifactId>hivefive-user</artifactId>
  </dependency>
  <!-- other feature modules -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
  <dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
  </dependency>
  <dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>test</scope>
  </dependency>
</dependencies>
<build>
  <plugins>
    <plugin>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-maven-plugin</artifactId>
    </plugin>
  </plugins>
</build>
```

## Package map (current → target)

| Current (`com.hivefive.api`) | Target module | Target package |
|-----------------------------|---------------|----------------|
| `domain/UserEntity` | hivefive-user | `com.hivefive.user.domain` |
| `repository/UserRepository` | hivefive-user | `com.hivefive.user.repository` |
| `web/dto/UserDto`, `UserPayload` | hivefive-user | `com.hivefive.user.web.dto` |
| `service/*User*` methods in CompatibilityService | hivefive-user | `com.hivefive.user.service.UserService` |
| Same pattern for board, card, status, role, checklist, userboard | respective module | `com.hivefive.<name>.*` |
| `config/*`, `HivefiveApiApplication`, `CompatibilityController`, `GlobalExceptionHandler` | hivefive-api-app | `com.hivefive.app.*` |
| `NotFoundException`, `UnauthorizedException`, `ErrorResponse` | hivefive-common | `com.hivefive.common.*` |

## Feature module extraction (completed for all contexts)

Modules live under `backend/hivefive-<name>/` with package `com.hivefive.<name>.*`.
Each module exposes a `@Service` (`RoleService`, `UserService`, etc.).
`hivefive-api-app` keeps `*CompatibilityController`, `DomainOrchestrationService`, `GlobalExceptionHandler`, config, and tests.
Cross-entity orchestration (e.g. `deleteUser`, `deleteUserBoard`) stays in `DomainOrchestrationService`.

## Pilot module extraction (role example)

1. Create `hivefive-role` with packages above.
2. Move `RoleEntity`, `RoleRepository`, role CRUD from `CompatibilityService` → `RoleService`.
3. In app module:

```java
// CompatibilityService or CompatibilityController
private final RoleService roleService;
// delegate getAllRoles(), etc.
```

4. Update imports in tests: `com.hivefive.role.domain.RoleEntity`.
5. Run `RoleCrudIntegrationTest` and `RoleCrudRealDbIntegrationTest`.

## Test layout

Keep integration tests in **app module** `src/test/java` (they need full Spring context and `application-test.yml`).

Feature modules: unit tests only (service mapping, validators) unless you add `@DataJpaTest` per module later.

## `CompatibilityService` decomposition strategy

Split by entity group; each group becomes a `@Service` in its feature module:

| Methods (examples) | New service |
|--------------------|-------------|
| `getAllUsers`, `createUser`, ... | `UserService` |
| `getAllBoards`, ... | `BoardService` |
| shared auth header checks | stay in app `AuthCompatibilityFilter` or `common` |

`CompatibilityService` shrinks to a façade (temporary) then delete after controller delegates directly.

## Commands cheat sheet

```bash
# build all modules
mvn -f backend/pom.xml clean test

# run app only
mvn -f backend/pom.xml -pl hivefive-api-app spring-boot:run

# build single module + dependents
mvn -f backend/pom.xml -pl hivefive-user -am test
```

## Rollback strategy

Each phase should be one commit. If tests fail:

- Revert only the last module extraction.
- Do not partially move entities without their repositories and service methods.
