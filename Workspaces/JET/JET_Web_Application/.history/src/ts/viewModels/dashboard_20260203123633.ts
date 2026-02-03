/**
 * @license
 * Copyright (c) 2014, 2024, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */

// --- Importaciones ---
import "demo-update-item-dialog/loader";
import * as ko from "knockout";
import "ojs/ojavatar";
import "ojs/ojchart";
import { ObservableKeySet } from "ojs/ojknockout-keyset";
import "ojs/ojlistview";
import * as Model from "ojs/ojmodel";
import "ojs/ojselectsingle";
import * as AccUtils from "../accUtils";
import CollectionDataProvider = require("ojs/ojcollectiondataprovider");

// --- Configuración de REST y Modelos ---

// URL base para la API REST de actividades.
const REST_URL = "https://oracleapex.com/ords/oraclejet/lp/activities/";

// Definición del Modelo y Colección para 'Activity'.
const ActivityModel = Model.Model.extend({
  idAttribute: "id",
});
const ActivityCollection = Model.Collection.extend({
  url: REST_URL,
  model: ActivityModel,
  comparator: "id",
});

// Definición del Modelo y Colección para 'Item'.
const ItemModel = Model.Model.extend({ idAttribute: "id" });
const ItemCollection = Model.Collection.extend({
  model: ItemModel,
  comparator: "id",
});

// --- ViewModel del Dashboard ---
class DashboardViewModel {
  // DataProviders: Intermediarios para las listas de la UI (Activities e Items).
  activityDataProvider: CollectionDataProvider<any, any>;
  itemsDataProvider: CollectionDataProvider<any, any>;

  // Colecciones internas de Oracle JET Model.
  private activityCollection: Model.Collection;
  private itemCollection: Model.Collection;

  // Estado de la Actividad seleccionada (por defecto ID 3: Baseball).
  activityKey: number = 3;
  restServerURLBase = REST_URL;

  // Observables de datos para el panel de detalles.
  itemData: ko.Observable<any>;
  pieSeriesValue: ko.ObservableArray;

  // Control de Selección (KeySets y flags de estado).
  selectedActivity = new ObservableKeySet();
  selectedItem = new ObservableKeySet();
  activitySelected = ko.observable(false);
  firstSelectedActivity = ko.observable();
  itemSelected = ko.observable(false);
  firstSelectedItem = ko.observable();

  // Estado de carga.
  dataFetched = ko.observable(true);

  // Control de Diálogos (Input y Modo).
  inputItem: ko.Observable<any>;
  dialogMode: ko.Observable<string>;

  constructor() {
    // 1. Inicialización de la colección y provider de Actividades.
    this.activityCollection = new ActivityCollection();
    this.activityDataProvider = new CollectionDataProvider(
      this.activityCollection
    );

    // 2. Inicialización de la colección y provider de Items (basado en la actividad por defecto).
    this.itemCollection = new ItemCollection();
    this.itemCollection.url = REST_URL + this.activityKey + "/items/";
    this.itemsDataProvider = new CollectionDataProvider(this.itemCollection);

    // 3. Inicialización de observables para detalles y gráficas.
    this.itemData = ko.observable("");
    this.pieSeriesValue = ko.observableArray([{}]);

    // 4. Inicialización del estado del diálogo.
    this.inputItem = ko.observable({});
    this.dialogMode = ko.observable("view");
  }

  // --- Gestión de Diálogos ---

  // Método genérico interno para abrir el diálogo.
  // Configura el modo (create/edit/etc) y los datos a mostrar.
  private openDialog(mode: string, data: any) {
    this.dialogMode(mode);
    this.inputItem(data);

    const dialogComponent = document.getElementById("itemActionDialog") as any;
    if (dialogComponent) {
      if (dialogComponent.open) {
        dialogComponent.open();
      } else {
        // Si el componente aún no está definido, espera a que cargue.
        customElements.whenDefined("demo-update-item-dialog").then(() => {
          dialogComponent.open();
        });
      }
    }
  }

  // Abre el diálogo en modo 'Create' con un objeto vacío.
  public openCreateDialog = () => {
    const emptyItem = {
      id: null,
      itemName: null,
      itemPrice: null,
      itemDesc: null,
      quantity_instock: null,
      quantity_shipped: null,
      itemImage: null,
    };
    this.openDialog("create", emptyItem);
  };

  // Abre el diálogo en modo 'Edit' con los datos actuales.
  public openEditDialog = () => {
    this.openDialog("edit", this.populateInputItem());
  };

  // Abre el diálogo en modo 'View' (solo lectura).
  public openViewDialog = () => {
    this.openDialog("view", this.populateInputItem());
  };

  // Abre el diálogo en modo 'Delete' para confirmar eliminación.
  public openDeleteDialog = () => {
    this.openDialog("delete", this.populateInputItem());
  };

  // Prepara los datos del ítem seleccionado para pasarlos al componente de diálogo.
  private populateInputItem() {
    const data = this.itemData();
    return {
      id: data.id,
      itemName: data.name,
      itemPrice: data.price,
      itemDesc: data.short_desc,
      quantity_instock: data.quantity_instock,
      quantity_shipped: data.quantity_shipped,
      itemImage: data.image,
    };
  }

  // --- Sincronización de Datos ---

  // Callback que se ejecuta cuando el diálogo completa una acción (Create/Update/Delete).
  // Recibe un evento con los detalles de la acción y datos actualizados.
  public refreshItems = (event: any) => {
    // 1. Refresca la lista de ítems desde el servidor.
    this.itemCollection.fetch();

    // 2. Si la acción fue 'edit', actualiza inmediatamente el panel de detalles con los datos nuevos.
    if (this.dialogMode() === "edit" && event.detail && event.detail.data) {
      this.itemData(event.detail.data);
    }

    // 3. Si la acción fue 'delete', limpia la selección actual.
    if (this.dialogMode() === "delete") {
      this.itemSelected(false);
      this.selectedItem.clear();
    }
  };

  // --- Manejo de Selección ---

  // Maneja el cambio de selección en la lista de Actividades.
  selectedActivityChanged = (event: any) => {
    let itemContext = event.detail.value.data;
    if (itemContext != null) {
      this.activitySelected(false);
      
      // Actualiza la clave y la URL de la colección de items.
      this.activityKey = event.detail.value.data.id;
      this.itemCollection.url = REST_URL + this.activityKey + "/items/";
      this.itemCollection.fetch();

      // Gestiona el estado visual y limpia la selección de items anterior.
      this.activitySelected(true);
      this.itemSelected(false);
      this.selectedItem.clear();
      this.itemData();
    } else {
      this.activitySelected(false);
      this.itemSelected(false);
    }
  };

  // Maneja el cambio de selección en la lista de Items.
  selectedItemChanged = (event: any) => {
    let isClicked = event.detail.value.data;
    if (isClicked != null) {
      // Actualiza los datos del ítem seleccionado.
      this.itemData(event.detail.value.data);
      
      // Actualiza la gráfica de tarta con los nuevos valores de stock.
      let pieSeries = [
        {
          name: "Quantity in Stock",
          items: [this.itemData().quantity_instock],
        },
        { name: "Quantity Shipped", items: [this.itemData().quantity_shipped] },
      ];
      this.pieSeriesValue(pieSeries);
      this.itemSelected(true);
    } else {
      this.itemSelected(false);
    }
  };

  // --- Ciclo de Vida ---
  
  connected(): void {
    AccUtils.announce("Dashboard page loaded.");
    document.title = "Dashboard";
  }
  disconnected(): void {}
  transitionCompleted(): void {}
}

export = DashboardViewModel;