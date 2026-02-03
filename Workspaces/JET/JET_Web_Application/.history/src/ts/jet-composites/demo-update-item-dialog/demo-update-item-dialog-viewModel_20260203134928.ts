/**
 * @license
 * Copyright (c) 2014, 2024, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */

"use strict";

// --- Importaciones ---
import "demo-update-item/loader";
import * as ko from "knockout";
import "ojs/ojbutton";
import * as Composite from "ojs/ojcomposite";
import "ojs/ojdialog";
import { ojDialog } from "ojs/ojdialog";
import * as model from "ojs/ojmodel";
import Context = require("ojs/ojcontext");

// --- Interfaces ---

// Propiedades que este componente recibe desde su padre (Dashboard).
interface ItemDialogProperties {
  item: {
    id: number | null;
    itemName: string | null;
    itemPrice: number | null;
    itemDesc: string | null;
    quantity_instock: number | null;
    quantity_shipped: number | null;
    itemImage: string | null;
  };
  mode: string;        // Modo de operación: 'create', 'edit', 'delete', 'view'
  activityKey: number; // ID de la actividad padre
  restUrl: string;     // URL base del servicio REST
}

// --- Definición del Modelo de Datos (Common Model) ---

// Configuración del modelo base para los Items, definiendo el atributo ID.
const ItemModel = model.Model.extend({
  idAttribute: "id",
  parseSave: function (attrs) {
    return {
      itemId: attrs.id,
      name: attrs.name,
      short_desc: attrs.short_desc,
      price: attrs.price,
      activity_id: attrs.activity_id,
    }
  }
});

// Define una colección que contendrá instancias de ItemModel.
const ItemCollection = model.Collection.extend({
  model: ItemModel,
});

// --- ViewModel Principal ---
export default class ViewModel
  implements Composite.ViewModel<ItemDialogProperties>
{
  // Control del contexto de ocupado (BusyContext) para la carga asíncrona.
  busyResolve: () => void;
  composite: Element;
  properties: Composite.PropertiesType;

  // Variables para la UI del diálogo.
  dialogTitle: ko.Computed<string>;
  dialogId: string;
  defaultImage: string = "../../css/images/product_images/jet_logo_256.png";

  constructor(context: Composite.ViewModelContext<Composite.PropertiesType>) {
    // 1. Configuración del contexto de espera (BusyContext).
    // Esto previene que la UI interactúe antes de que el componente esté listo.
    const elementContext: Context = Context.getContext(context.element);
    const busyContext: Context.BusyContext = elementContext.getBusyContext();
    const options = { description: "Web Component Startup - Waiting for data" };
    this.busyResolve = busyContext.addBusyState(options);

    this.composite = context.element;
    this.properties = context.properties;

    // Resolvemos el estado de espera inmediatamente ya que no hay carga inicial de datos.
    this.busyResolve();

    // 2. Generación de un ID único para el diálogo.
    // Usamos context.unique para evitar conflictos si hay múltiples instancias.
    this.dialogId = context.unique + "_actionDialog";

    // 3. Título dinámico del diálogo.
    // Calcula el título de la ventana basándose en el modo de operación actual.
    this.dialogTitle = ko.computed<string>(() => {
      switch (this.properties.mode) {
        case "create":
          return "Create New Item";
        case "edit":
          return "Update Item Details";
        case "delete":
          return "Delete Item";
        case "view":
          return "View Item Details";
        default:
          return "Item Action";
      }
    });
  }

  // --- Métodos Auxiliares ---

  // Método para abrir el diálogo buscando el elemento en el DOM por su ID único.
  public open = () => {
    const dialog = document.getElementById(this.dialogId) as ojDialog;
    if (dialog) dialog.open();
  };

  // Método para cerrar el diálogo programáticamente.
  public close = () => {
    const dialog = document.getElementById(this.dialogId) as ojDialog;
    if (dialog) dialog.close();
  };

  // Helper privado para obtener una nueva instancia de la Colección.
  // Construye la URL dinámicamente usando la Actividad seleccionada.
  private getCollection() {
    const collection = new ItemCollection();
    collection.url = `${this.properties.restUrl}${this.properties.activityKey}/items/`;
    return collection;
  }

  // --- Operaciones CRUD (Create, Read, Update, Delete) ---

  // 1. CREAR ITEM (POST)
  public createItem = async () => {
    const currentData = this.properties.item;

    // Validación básica: asegura campos requeridos y longitud mínima de descripción.
    if (
      !currentData.itemDesc ||
      currentData.itemDesc.length < 5 ||
      !currentData.itemName ||
      currentData.itemPrice === null
    ) {
      return; // Detiene la ejecución si la validación falla.
    }

    // Calcula la cantidad total (stock + enviados).
    const quantity =
      Number(currentData.quantity_instock || 0) +
      Number(currentData.quantity_shipped || 0);

    // Prepara el objeto de datos (payload) para enviar al servidor.
    const row = {
      name: currentData.itemName,
      short_desc: currentData.itemDesc,
      price: currentData.itemPrice,
      quantity_instock: currentData.quantity_instock,
      quantity_shipped: currentData.quantity_shipped,
      quantity: quantity,
      activity_id: this.properties.activityKey,
      image: currentData.itemImage || this.defaultImage,
    };

    const collection = this.getCollection();

    // Llama a .create() del Common Model (realiza petición POST).
    collection.create(row, {
      wait: true, // Espera respuesta del servidor antes de confirmar localmente.
      contentType: "application/json; charset=UTF-8",
      success: (model: any, response: any) => {
        // Éxito: Notifica al padre y cierra el diálogo.
        this.notifySuccess();
      },
      error: (model: any, xhr: any) => {
        // Error: Loguea el fallo y cierra el diálogo.
        console.error("Error creating item: ", xhr);
      },
    });
    this.close();
  };

  // 2. ACTUALIZAR ITEM (PUT)
  public updateItem = async () => {
    const currentRow = this.properties.item;
    if (currentRow != null) {
      // Prepara datos actualizados para el payload.
      const row = {
        itemId: currentRow.id,
        name: currentRow.itemName,
        short_desc: currentRow.itemDesc,
        price: currentRow.itemPrice,
        activity_id: this.properties.activityKey,
      };
      
      const collection = this.getCollection();
      
      // Crea un modelo temporal con el ID existente para apuntar al recurso correcto.
      const model = new ItemModel({ id: currentRow.id });
      model.urlRoot = collection.url;
      
      // Llama a .save() (realiza petición PUT al tener ID).
      model.save(row, {
        wait: true,
        method: "PUT",
        success: (model: any, response: any) => {
          collection.refresh();
          this.notifySuccess(response || row);
        },
        error: (model: any, xhr: any) => {
          // A veces Backbone interpreta un 200 sin cuerpo como error de parseo.
          // Si el status es 200 (OK) o 204 (No Content), es un éxito real.
          if (xhr.status >= 200 && xhr.status < 300) {
            collection.refresh();
            this.notifySuccess(row);
          } else {
            console.log("Error updating item: ", xhr);
          }
        },
      });
      this.close();
    }
  };

  // 3. BORRAR ITEM (DELETE)
  public deleteItem = async () => {
    const currentData = this.properties.item;
    if (currentData.id === null) return;
    
    const collection = this.getCollection();
    const model = new ItemModel({ id: currentData.id });
    model.urlRoot = collection.url;

    // Llama a .destroy() (realiza petición DELETE).
    model.destroy({
      wait: true,
      data: null,
      success: (model: any, response: any) => {
        this.notifySuccess();
      },
      error: (model: any, xhr: any) => {
        console.log("Error deleting item: ", xhr);
      },
    });
    this.close();
  };

  // --- Notificación de Eventos ---

  // Notifica al componente padre que la acción ha terminado exitosamente.
  // Recibe opcionalmente 'data' con la respuesta del servidor (útil en updates).
  private notifySuccess(data?: any) {
    this.composite.dispatchEvent(
      // Dispara un evento personalizado 'actionComplete'.
      // 'bubbles: true' permite que el evento suba por el DOM hasta el Dashboard.
      new CustomEvent("actionComplete", {
        bubbles: true,
        detail: { action: this.properties.mode, data: data },
      })
    );
  }
    
  // --- Ciclo de Vida (Hooks) ---

  // Métodos estándar del ciclo de vida de componentes JET.
  connected(context: Composite.ViewModelContext<ItemDialogProperties>): void {}
  disconnected(element: Element): void {}
  propertyChanged(
    context: Composite.PropertyChangedContext<ItemDialogProperties>
  ): void {}
}