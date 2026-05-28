---
name: soa-osb-component-to-springboot
description: Migrates one legacy SOA/OSB CRUD component to Spring Boot in HiveFive with strict compatibility contracts. Use when the user asks to migrate an individual module from middleware to backend, including controller/service/entity/repository and transactional behavior.
disable-model-invocation: true
---

# SOA/OSB Component -> Spring Boot

## Goal
Migrate one component at a time from middleware (`SOA/OSB`) into the matching `backend/hivefive-<domain>` module (and `hivefive-api-app` controllers) while preserving external behavior.

## Use this skill when
- User asks to migrate one middleware component in detail.
- User asks for endpoint-by-endpoint backend migration.
- User needs compatibility behavior preserved for current frontend clients.

## Non-negotiable backend rules
- Keep compatibility routes under `/api/v1` style used in `*CompatibilityController` (`hivefive-api-app`).
- Preserve wrapper payload contracts (`User`, `Board`, `Card`, `Status`, `Role`, `ChecklistItem`, `UserBoard`) when already used.
- Keep table naming singular and explicit `@Table(name="...")`.
- Do not enable runtime DDL changes (`ddl-auto: none`).
- Keep `hibernate.globally_quoted_identifiers: true`.

## Step-by-step workflow
1. Pick component boundary (example: `CRUD_USER`).
2. Read legacy operations in:
   - `middleware/CRUD_HIVEFIVE/CRUD_<COMPONENT>/SOA/composite.xml`
   - BPEL and adapter files under same module.
3. Extract CRUD operations and data fields from legacy requests/responses.
4. Map each operation to Spring target:
   - Controller endpoint in `hivefive-api-app` (`*CompatibilityController`)
   - Service method in `hivefive-<domain>` (`*Service`)
   - DTO payload and response wrappers in `web/dto`
   - Entity/repository persistence path.
5. Implement incrementally by operation:
   - `get-all` and `get/{id}`
   - `create`
   - `update`
   - `delete`
6. Preserve compatibility defaults already used in backend where relevant.
7. Add or adjust tests in H2 integration suite for the migrated operation set.

## Mapping template (required)
Use this exact structure:

```markdown
Component: <name>

Legacy operation: <soa/osb op name>
Spring endpoint: <method + /api/v1/...>
Request contract: <legacy shape>
Response contract: <legacy shape>
Service method: <DomainService method>
Persistence mapping: <Entity + Repository>
Validation rules: <required fields/business rules>
Error mapping: <400/404/500 + codigo/mensaje behavior>
```

## Validation checklist
- [ ] Endpoint path and verb match client expectations.
- [ ] Wrapper keys are exact.
- [ ] Entity table name is exact singular.
- [ ] Not found and validation errors map through `GlobalExceptionHandler`.
- [ ] H2 tests cover happy path + at least one negative path.

## Definition of done
- Selected component works end-to-end through `/api/v1`.
- React services that depend on the component continue to work without contract changes.
- Integration tests pass for the touched operations.
