Actua como un experto desarrollador de Oracle SOA Suite 12c. Necesito que generes las plantillas XML de Input (Peticion) y Output (Respuesta esperada) para usarlas en los tests unitarios (SCA Test Modeler) de un componente llamado CRUD_ROLE.

La estructura base de los XML debe usar el adaptador de base de datos de TopLink con este namespace: `xmlns="http://xmlns.oracle.com/pcbpel/adapter/db/top/dbReference"`.
La entidad principal usa las etiquetas `<RoleCollection><Role>`.
Asume que los campos de la tabla Role son: id, name.

Genera los pares exactos de Input y Output en formato XML para las siguientes 5 operaciones:

1. Create: Input enviando todos los campos excepto 'id'. Output devolviendo lo mismo pero con el 'id' generado.
2. Delete: Input enviando solo el 'id' dentro de <RoleCollection><Role>. Output devolviendo unicamente el texto plano "role deleted".
3. Get All: Input enviando la etiqueta vacia <process xmlns="http://xmlns.oracle.com/CRUD_HIVEFIVE/CRUD_ROLE/getAllRole"/>. Output devolviendo un <RoleCollection> con al menos dos <Role> de ejemplo.
4. Select By ID: Input enviando <process xmlns="http://xmlns.oracle.com/CRUD_HIVEFIVE/CRUD_ROLE/getRoleByPrimaryKey"> que envuelva al <Role> con solo el <id>. Output devolviendo un solo <Role> completo.
5. Update: Input enviando todos los campos (incluido el 'id' a actualizar). Output devolviendo exactamente el mismo XML que el Input.

Devuelveme solo los bloques de codigo XML bien formateados y separados por operacion.