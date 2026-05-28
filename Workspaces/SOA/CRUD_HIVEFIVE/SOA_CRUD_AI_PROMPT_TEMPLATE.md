# Prompt maestro generico para IA (tests XML Oracle SOA 12c)

Copia este prompt y reemplaza los campos `{{...}}`.

---

Actua como experto en Oracle SOA Suite 12c y SCA Test Modeler.

Contexto:

- Proyecto: `{{PROJECT_NAME}}`
- Modulo: `{{MODULE_NAME}}`
- Ruta testsuites: `{{TESTSUITES_PATH}}`
- Ruta templates: `{{TEMPLATES_PATH}}`
- Operacion objetivo: `{{OPERATION_NAME}}`
- Test base canonico: `{{BASE_TEST_FILE}}`

Regla obligatoria:

1. El primer paso se hace en JDeveloper: clic derecho en `testsuites` y crear suite + test (en el mismo flujo), con input/output autogenerado.
2. Tu trabajo empieza despues de eso.
3. Debes usar ese test base como estructura canonica.
4. No inventes estructura XML ni cambies la arquitectura del test.

Partes que debes conservar:

- bloque `<compositeTest>`
- bloque `<initiate ...>`
- bloque `<wireActions ...>`
- `serviceName`, `wireSource`, `operation`
- namespaces y prefijos existentes

Partes que puedes modificar:

- payload input
- expected output/fault
- descripcion del test
- nombre del nuevo archivo

Objetivo de esta tarea:

- Crear `{{NUM_TESTS}}` tests nuevos para `{{OPERATION_NAME}}` a partir de `{{BASE_TEST_FILE}}`.
- Guardarlos en `{{OUTPUT_TESTS_FOLDER}}`.
- Crear para cada test su plantilla:
  - `{{TEMPLATES_PATH}}/{{METHOD_FOLDER}}/{{TEST_NAME}}/input/Input.xml`
  - `{{TEMPLATES_PATH}}/{{METHOD_FOLDER}}/{{TEST_NAME}}/output/Output.xml`

Cobertura deseada:

- un caso feliz completo (`xml-similar`)
- un caso de validacion minima por XPath (`string`)
- un caso con campos extra/entrada tolerante
- un caso not found
- un caso borde de datos

Restricciones tecnicas:

- Si usas assert `string`, el XPath debe devolver nodo/texto.
- No uses funciones XPath numericas que puedan romper el evaluador (por ejemplo `count(...)`) si el motor espera NodeSet.
- Si el framework falla en tests de fault por limitacion tecnica, documenta alternativa equivalente.

Formato de salida esperado:

1. Lista de archivos creados/modificados.
2. Explicacion breve de que valida cada test.
3. Orden recomendado de ejecucion segun dependencias de datos.
4. XML final listo para ejecutar, sin pseudocodigo.

---

## Ejemplo rapido

- `{{PROJECT_NAME}} = MiProyectoSOA`
- `{{MODULE_NAME}} = CRUD_ENTIDAD`
- `{{TESTSUITES_PATH}} = CRUD_ENTIDAD/SOA/testsuites`
- `{{TEMPLATES_PATH}} = CRUD_ENTIDAD/SOA/templates`
- `{{OPERATION_NAME}} = updateEntidad`
- `{{BASE_TEST_FILE}} = CRUD_ENTIDAD/SOA/testsuites/Update_Entidad_Tests/tests/UpdateEntidad.xml`
- `{{NUM_TESTS}} = 3`
- `{{OUTPUT_TESTS_FOLDER}} = CRUD_ENTIDAD/SOA/testsuites/Update_Entidad_Tests/tests`
- `{{METHOD_FOLDER}} = Update`

