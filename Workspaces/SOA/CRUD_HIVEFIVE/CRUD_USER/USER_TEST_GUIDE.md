Actua como un experto desarrollador de Oracle SOA Suite 12c. Necesito que generes las plantillas XML de Input (Peticion) y Output (Respuesta esperada) para usarlas en los tests unitarios (SCA Test Modeler) de un componente llamado CRUD_USER.

La estructura base de los XML debe usar el adaptador de base de datos de TopLink con este namespace: `xmlns="http://xmlns.oracle.com/pcbpel/adapter/db/top/dbReference"`.
La entidad principal usa las etiquetas `<UserCollection><User>`.
Asume que los campos de la tabla User son: id, roleId, email, firstName, lastName, password.

Genera los pares exactos de Input y Output en formato XML para las siguientes 5 operaciones:

1. Create: Input enviando todos los campos excepto 'id'. Output devolviendo lo mismo pero con el 'id' generado.
2. Delete: Input enviando solo el 'id' dentro de <UserCollection><User>. Output devolviendo unicamente el texto plano "user deleted".
3. Get All: Input enviando la etiqueta vacia <process xmlns="http://xmlns.oracle.com/CRUD_HIVEFIVE/CRUD_USER/getAllUser"/>. Output devolviendo un <UserCollection> con al menos dos <User> de ejemplo.
4. Select By ID: Input enviando <process xmlns="http://xmlns.oracle.com/CRUD_HIVEFIVE/CRUD_USER/getUserByPrimaryKey"> que envuelva al <User> con solo el <id>. Output devolviendo un solo <User> completo.
5. Update: Input enviando todos los campos (incluido el 'id' a actualizar). Output devolviendo exactamente el mismo XML que el Input.

Devuelveme solo los bloques de codigo XML bien formateados y separados por operacion.