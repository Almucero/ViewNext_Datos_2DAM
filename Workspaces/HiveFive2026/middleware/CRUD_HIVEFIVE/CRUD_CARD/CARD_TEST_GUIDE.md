Actúa como un experto desarrollador de Oracle SOA Suite 12c. Necesito que generes las plantillas XML de Input (Petición) y Output (Respuesta esperada) para usarlas en los tests unitarios (SCA Test Modeler) de un componente llamado CRUD_CARD.

La estructura base de los XML debe usar el adaptador de base de datos de TopLink con este namespace: `xmlns="http://xmlns.oracle.com/pcbpel/adapter/db/top/dbReference"`.
La entidad principal usa las etiquetas `<CardCollection><Card>`.
Asume que los campos de la tabla Card son: id, title, description, listId, asigneeId.

Genera los pares exactos de Input y Output en formato XML para las siguientes 5 operaciones:

1. Create: Input enviando todos los campos excepto 'id'. Output devolviendo lo mismo pero con el 'id' generado.
2. Delete: Input enviando solo el 'id' dentro de <CardCollection><Card>. Output devolviendo únicamente el texto plano "card deleted".
3. Get All: Input enviando la etiqueta vacía <process xmlns="http://xmlns.oracle.com/CRUD_HIVEFIVE/CRUD_CARD/getAllCard"/>. Output devolviendo un <CardCollection> con al menos dos <Card> de ejemplo.
4. Select By ID: Input enviando <process xmlns="http://xmlns.oracle.com/CRUD_HIVEFIVE/CRUD_CARD/getCardByPrimaryKey"> que envuelva al <Card> con solo el <id>. Output devolviendo un solo <Card> completo.
5. Update: Input enviando todos los campos (incluido el 'id' a actualizar). Output devolviendo exactamente el mismo XML que el Input.

Devuélveme solo los bloques de código XML bien formateados y separados por operación.
