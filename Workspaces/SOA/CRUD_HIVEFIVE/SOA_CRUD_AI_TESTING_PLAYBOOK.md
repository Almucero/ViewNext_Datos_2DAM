# Playbook generico para generar tests BPEL con IA (Oracle SOA 12c)

## Objetivo

Este documento define un metodo reutilizable para crear y escalar tests unitarios en proyectos SOA (CRUD o similares) con Oracle SOA Suite 12c y SCA Test Modeler.

Aplica a cualquier modulo con:

- BPEL ya implementado,
- operaciones expuestas por WSDL,
- adaptadores (DB, REST/SOAP, etc.),
- carpeta `testsuites`.

## Flujo recomendado de trabajo

### 1) Primer paso obligatorio en JDeveloper

Con los BPEL creados y conectados:

1. Ir a la carpeta `testsuites` del modulo.
2. Clic derecho sobre `testsuites`.
3. Crear una suite y un test (JDeveloper lo hace en el mismo flujo).
4. Cuando solicite input/output, autogenerar ambos.

Este paso es clave porque genera el XML base que el framework acepta en ese proyecto.

### 2) Congelar el test base como estructura canonica

El primer test generado es la plantilla de verdad. Desde ese momento:

- Mantener inmutable la estructura del archivo.
- Usar ese XML como referencia para todos los tests nuevos.

Partes que no se deben alterar salvo necesidad real:

- `<compositeTest ...>`
- `<initiate serviceName="..." operation="process" ...>`
- `<wireActions wireSource="..." operation="process">`
- bloques base de `<assert>`, `<expected>`, `<location>`
- namespaces y prefijos existentes

## Regla critica para IA

La IA **no debe inventarse el esqueleto XML**. Solo puede cambiar:

- payload de entrada,
- expected de salida/fault,
- tipo de asercion si se pide explicitamente,
- nombre del test y descripcion.

## 3) Generar mas tests con IA a partir del canon

A partir del test base:

- duplicar archivo,
- renombrar segun objetivo,
- ajustar input/expected sin romper estructura.

Casos recomendados por operacion:

- Caso feliz completo (`xml-similar`).
- Caso de contrato minimo (XPath sobre un campo clave).
- Caso con campos extra/tolerancia de entrada.
- Caso not found.
- Caso borde de datos.

## 4) Gestionar dependencias entre tests

En CRUD reales, muchos tests no son idempotentes:

- `create` puede fallar si se repite con la misma PK.
- `delete` puede requerir precreacion.
- `update` y `getById` dependen del estado actual de la fila.
- `getAll` puede depender del orden de retorno.

Siempre documentar:

- precondiciones por test,
- efectos colaterales tras ejecutar,
- orden recomendado de ejecucion.

## Patrones de asercion recomendados

### `xml-similar`

- Usar cuando se quiere validar estructura completa de respuesta.
- Ideal para contratos estrictos.

### `string` + XPath

- Usar para validar un campo puntual.
- El XPath debe devolver nodo/texto.
- Evitar funciones que devuelven numero en motores que esperan NodeSet.

### Tests de fault

- En algunos entornos Oracle SOA 12c, ciertas aserciones de fault pueden producir `Errored` por limitaciones del framework.
- Si pasa, documentar:
  - comportamiento funcional observado en audit/log,
  - limitacion tecnica de la herramienta,
  - estrategia alternativa de validacion.

## Estructura recomendada de plantillas

Para mantener trazabilidad, usar una carpeta `templates` separada de `testsuites`:

- `SOA/templates/<Metodo>/<NombreTest>/input/Input.xml`
- `SOA/templates/<Metodo>/<NombreTest>/output/Output.xml`

Ejemplo de metodos:

- `Create`
- `Delete`
- `GetAll`
- `SelectById`
- `Update`

## Checklist antes de ejecutar una suite

- El test refleja un objetivo unico y claro.
- `serviceName` y `wireSource` coinciden con la operacion correcta.
- Input y output respetan WSDL/XSD reales.
- El tipo de assert coincide con el objetivo.
- El XPath es compatible con el motor de aserciones.
- Se conoce si el test requiere setup/teardown de datos.

## Buenas practicas operativas

- Definir dataset base para pruebas repetibles.
- Separar tests de smoke, regresion y negativos.
- Mantener un documento de orden de ejecucion.
- Si no hay reset automatico de BD, ejecutar secuencias controladas.

