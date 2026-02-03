"use strict";

// --- Importaciones ---
import "demo-update-item/loader";
import * as ko from "knockout";
import "ojs/ojbutton";
import * as Composite from "ojs/ojcomposite";
import "ojs/ojdialog";
import { ojDialog } from "ojs/ojdialog";
import * as model from "ojs/ojmodel";
import { Collection, Model } from "ojs/ojmodel";
import Context = require("ojs/ojcontext");

// --- Definición de Tipos ---
// Estructura de un Item tal como viene de la base de datos/API.
type Item = {
  id: number;
  name: string;
  short_desc: string;
  price: number;
  quantity: number;
  quantity_shipped: number;
  quantity_instock: number;
  activity_id: number;
  image: string;
  value?: string;
};

// Propiedades que este componente recibe desde su padre.
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
  mode: string;
  activityKey: number;
  restUrl: string;
}

// --- Definición del Modelo de Datos (Common Model) ---
const ItemModel = model.Model.extend({
  idAttribute: "id",
});

// Define una colección que contendrá instancias de ItemModel.
const ItemCollection = model.Collection.extend({
  model: ItemModel,
});

export default class ViewModel
  implements Composite.ViewModel<ItemDialogProperties>
{
  busyResolve: () => void;
  composite: Element;
  properties: Composite.PropertiesType;



  // Función para transformar datos antes de guardarlos (en este caso, los pasa tal cual).
  private parseSaveItem = (response: Item) => {
    return {
      ...response,
    };
  };

  // Función para procesar los datos recibidos del servidor antes de usarlos.
  private parseItem = (response: {
    id: number;
    name: string;
    short_desc: string;
    price: number;
    quantity: number;
    quantity_shipped: number;
    quantity_instock: number;
    activity_id: number;
    image: string;
    value?: string;
  }): Item => {
    return {
      ...response,
    };
  };



  // Instancia de la colección de items.
  private itemCollection = new ItemCollection();

  // Variables para la UI del diálogo.
  dialogTitle: ko.Computed<string>;
  dialogId: string;
  defaultImage: string = "../../css/images/product_images/jet_logo_256.png";

  constructor(context: Composite.ViewModelContext<Composite.PropertiesType>) {
    // 1. Configuración del contexto de espera (BusyContext).
    const elementContext: Context = Context.getContext(context.element);
    const busyContext: Context.BusyContext = elementContext.getBusyContext();
    const options = { description: "Web Component Startup - Waiting for data" };
    this.busyResolve = busyContext.addBusyState(options);

    this.composite = context.element;
    this.properties = context.properties;

    this.busyResolve();

    // 2. Generación de un ID único para el diálogo.
    this.dialogId = context.unique + "_actionDialog";

    // 3. Título dinámico del diálogo.
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

  // --- Ciclo de Vida (Hooks) ---
  connected(context: Composite.ViewModelContext<ItemDialogProperties>): void {}
  disconnected(element: Element): void {}
  propertyChanged(
    context: Composite.PropertyChangedContext<ItemDialogProperties>
  ): void {}

  // --- Métodos Auxiliares ---

  // Crea y configura una nueva instancia de Collection apuntando a la URL correcta.
  public createCollection = () => {
    let itemURL =
      "https://apex.oracle.com/pls/apex/oraclejet/lp/activities/" +
      this.properties.activityKey +
      "/items";
    let myItemCollection = Collection.extend({
      url: itemURL,
      model: Model.extend({
        urlRoot: itemURL,
        parse: this.parseItem,
        parseSave: this.parseSaveItem,
        idAttribute: "id",
      }),
      comparator: "id",
    });
    return new myItemCollection();
  };

  // Método para abrir el diálogo buscando el elemento por su ID único.
  public open = () => {
    const dialog = document.getElementById(this.dialogId) as ojDialog;
    if (dialog) dialog.open();
  };

  // Método para cerrar el diálogo.
  public close = () => {
    const dialog = document.getElementById(this.dialogId) as ojDialog;
    if (dialog) dialog.close();
  };

  // Helper privado para obtener una colección base configurada con la URL REST.
  private getCollection() {
    const collection = new ItemCollection();
    collection.url = `${this.properties.restUrl}${this.properties.activityKey}/items/`;
    return collection;
  }

  // --- Operaciones CRUD (Create, Read, Update, Delete) ---

  // 1. CREAR ITEM (POST)
  public createItem = async () => {
    const currentData = this.properties.item;
    // Validación básica: campos requeridos y longitud mínima.
    if (
      !currentData.itemDesc ||
      currentData.itemDesc.length < 5 ||
      !currentData.itemName ||
      currentData.itemPrice === null
    ) {
      return;
    }

    // Calcula la cantidad total (stock + enviados).
    const quantity =
      Number(currentData.quantity_instock || 0) +
      Number(currentData.quantity_shipped || 0);

    // Prepara el objeto de datos para enviar al servidor.
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

    // Llama a .create() del Common Model (hace un POST).
    collection.create(row, {
      wait: true,
      contentType: "application/json; charset=UTF-8",
      success: (model: any, response: any) => {
        this.notifySuccess();
        this.close();
      },
      error: (model: any, xhr: any) => {
        console.error("Error creating item: ", xhr);
        this.close();
      },
    });
  };

  // 2. ACTUALIZAR ITEM (PUT)
  public updateItem = async () => {
    const currentRow = this.properties.item;
    if (currentRow != null) {
      // Prepara datos actualizados.
      const row = {
        itemId: currentRow.id,
        name: currentRow.itemName,
        short_desc: currentRow.itemDesc,
        price: currentRow.itemPrice,
        activity_id: this.properties.activityKey,
      };
      const collection = this.getCollection();
      // Crea un modelo temporal con el ID existente.
      const model = new ItemModel({ id: currentRow.id });
      model.urlRoot = collection.url;
      // Llama a .save() (hace un PUT porque el modelo tiene ID).
      model.save(row, {
        wait: true,
        method: "PUT",
        success: (model: any, response: any) => {
          collection.refresh();
          this.notifySuccess(response);
          this.close();
        },
        error: (model: any, xhr: any) => {
          console.log("Error updating item: ", xhr);
          this.close();
        },
      });
    }
  };

  // 3. BORRAR ITEM (DELETE)
  public deleteItem = async () => {
    const currentData = this.properties.item;
    if (currentData.id === null) return;
    const collection = this.getCollection();
    const model = new ItemModel({ id: currentData.id });
    model.urlRoot = collection.url;

    // Llama a .destroy() (hace un DELETE).
    model.destroy({
      wait: true,
      data: null,
      success: (model: any, response: any) => {
        this.notifySuccess();
        this.close();
      },
      error: (model: any, xhr: any) => {
        console.log("Error deleting item: ", xhr);
        this.close();
      },
    });
  };

  // Notifica al componente padre que la acción ha terminado exitosamente.
  private notifySuccess(data?: any) {
    this.composite.dispatchEvent(
      // Dispara un evento personalizado 'actionComplete' que sube (bubbles) por el DOM.
      new CustomEvent("actionComplete", {
        bubbles: true,
        detail: { action: this.properties.mode, data: data },
      })
    );
  }
}
