---
name: fullstack-testing-hivefive
description: Runs and maintains test workflows in HiveFive across Oracle JET, Spring Boot, and React. Requires paired coverage for binary behavior (assert true and false, valid/invalid, success/failure) unless contractually impossible. Use when the user asks to execute, create, or debug tests, especially Spring Boot split into mock-like H2 integration tests and real project database integration tests.
disable-model-invocation: true
---

# Fullstack Testing (HiveFive)

## Goal
Execute and evolve tests across all project stacks with one consistent workflow:
- JET
- Spring Boot (2 groups)
- React

Every new or changed test logic must prove **both sides** of binary outcomes: cases where the expectation is **true** and cases where it is **false** (validators, guards, flags, optional presence, success vs error paths). A single-sided test suite is incomplete.

## Use this skill when
- User asks to "hacer tests" in one or more layers.
- User asks for backend tests in 2 groups:
  - mock-like tests that validate methods/flows without real DB dependency (H2 profile).
  - tests against real project DB (RealDB profile).
- Tests are failing and need diagnosis/fix.

## Test groups and commands

### 1) Oracle JET (`frontend-jet`)
Run:

```bash
cd frontend-jet
npm test
```

Notes:
- Uses Karma config: `frontend-jet/test-config/karma.conf.js`.
- Focus test areas: `frontend-jet/src/ts/viewModels/__tests__`.

### 2) Spring Boot - Group A (mock-like / no real DB, H2)
Run:

```bash
mvn -f backend/pom.xml test
```

Scope:
- Integration tests with in-memory H2 under:
  - `src/test/java/com/hivefive/api/tests/h2`
- This is the default "que funcionen los metodos y contratos" lane.

Important:
- Keep `application-test.yml` schema-generation override active, otherwise H2 may fail with missing tables.

### 3) Spring Boot - Group B (Real project DB)
Run full group:

```bash
mvn -f backend/pom.xml -pl hivefive-api-app -DrunRealDbTests=true -Dtest="*RealDbIntegrationTest" test
```

Run one class example:

```bash
mvn -DrunRealDbTests=true -Dtest=UserCrudRealDbIntegrationTest test
```

Scope:
- Real DB integration under:
  - `src/test/java/com/hivefive/api/tests/realdb`

### 4) React (`frontend`)
Run:

```bash
cd frontend
npm test
```

Optional checks:

```bash
npm run build
npm run lint
```

## True and false coverage (mandatory)

When writing or extending tests (any stack), do not stop at one branch.

| Situation | Require |
|-----------|---------|
| Boolean predicate, `isValid`, feature flag, permission | At least one example where the result is **asserted true** and one where it is **asserted false**. |
| Validation (form, DTO, ViewModel) | At least one **valid** payload (passes / returns ok) and one **invalid** payload (fails / returns expected error). |
| HTTP or service layer | Success response **and** representative failure (4xx/5xx or mapped error) when the behavior is conditional on input or state. |
| Mocks / stubs | Configure mocks so both the “allowed” and “denied” (or “found” / “not found”) paths are exercised, not only the happy path. |

Naming and structure:
- Prefer **paired** `it`/`test` blocks or `describe` groups that make the true/false pairing obvious (e.g. `when input is valid` / `when input is invalid`).
- If the production API returns a boolean, **never** assert only one return value unless the other branch is impossible by contract (then document why in the test).

This applies to JET Karma specs, Spring Boot tests (H2 and RealDB where relevant), and React/Vitest tests.

## Creation/maintenance workflow
1. Pick stack and test group (JET, Spring-H2, Spring-RealDB, React).
2. If adding or changing behavior under test, plan **true + false** (or success + failure) cases before implementing; implement both in the same change when feasible.
3. Reproduce failing test first with the smallest scope possible.
4. Fix production code or test setup (not both blindly).
5. Re-run:
   - targeted class/spec
   - then full group
   - then dependent groups when contract changed.
6. Report:
   - files changed
   - tests run
   - current pass/fail status
   - residual risks.

## Spring Boot guardrails
- Do not collapse H2 and RealDB into one suite; keep both lanes.
- Keep compatibility API contracts stable (`/api/v1`, wrapper payload keys).
- Do not change runtime schema policy for tests convenience.

## Output format required
Use this format in responses:

```markdown
Stack: <JET | Spring-H2 | Spring-RealDB | React>
Objective: <what is being validated>
True/false (or success/failure) coverage: <brief note on both branches tested, or justified exception>
Executed: <commands>
Result: <pass/fail + key errors>
Changes made: <files>
Next action: <if needed>
```

## Definition of done
- Requested stack(s) tested with correct command set.
- For Spring Boot, both requested groups are clearly separated and executable.
- New or touched tests include **both** expected outcomes where the behavior is binary or validation-shaped (true/false, valid/invalid, success/failure), unless explicitly out of scope with a justified exception.
- Failures (if any) include concrete root cause and next fix step.
