Actua como un experto desarrollador de Oracle SOA Suite 12c. Necesito que generes las plantillas XML de Input (Peticion) y Output (Respuesta esperada) para usarlas en los tests unitarios (SCA Test Modeler) de un componente llamado CRUD_CHECKLIST_ITEM.

La estructura base de los XML debe usar el adaptador de base de datos de TopLink con este namespace: `xmlns="http://xmlns.oracle.com/pcbpel/adapter/db/top/dbChecklistItem"`.
La entidad principal usa las etiquetas `<ChecklistItemCollection><ChecklistItem>`.
Asume que los campos de la tabla ChecklistItem son: id, cardId, completed, taskId, name.

Genera los pares exactos de Input y Output en formato XML para las siguientes 5 operaciones:

1. Create: Input enviando todos los campos excepto 'id'. Output devolviendo lo mismo pero con el 'id' generado.
2. Delete: Input enviando solo el 'id' dentro de <ChecklistItemCollection><ChecklistItem>. Output devolviendo unicamente el texto plano "checklist item deleted".
3. Get All: Input enviando la etiqueta vacia <process xmlns="http://xmlns.oracle.com/CRUD_HIVEFIVE/CRUD_CHECKLIST_ITEM/getAllChecklistItem"/>. Output devolviendo un <ChecklistItemCollection> con al menos dos <ChecklistItem> de ejemplo.
4. Select By ID: Input enviando <process xmlns="http://xmlns.oracle.com/CRUD_HIVEFIVE/CRUD_CHECKLIST_ITEM/getChecklistItemByPrimaryKey"> que envuelva al <ChecklistItem> con solo el <id>. Output devolviendo un solo <ChecklistItem> completo.
5. Update: Input enviando todos los campos (incluido el 'id' a actualizar). Output devolviendo exactamente el mismo XML que el Input.

Devuelveme solo los bloques de codigo XML bien formateados y separados por operacion.