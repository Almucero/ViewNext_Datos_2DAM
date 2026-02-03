/**
 * @license
 * Copyright (c) 2014, 2024, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */

import "demo-update-item-dialog/loader";
import * as ko from "knockout";
import "ojs/ojavatar";
import "ojs/ojchart";
import { ObservableKeySet } from "ojs/ojknockout-keyset";
import "ojs/ojlistview";
import * as Model from "ojs/ojmodel";
import * as AccUtils from "../accUtils";
import CollectionDataProvider = require("ojs/ojcollectiondataprovider");

// REST API Base URL
const REST_URL = "https://oracleapex.com/ords/oraclejet/lp/activities/";

// Activity Model and Collection
const ActivityModel = Model.Model.extend({
  idAttribute: "id",
});
const ActivityCollection = Model.Collection.extend({
  url: REST_URL,
  model: ActivityModel,
  comparator: "id",
});

// Item Model and Collection
const ItemModel = Model.Model.extend({ idAttribute: "id" });
const ItemCollection = Model.Collection.extend({
  model: ItemModel,
  comparator: "id",
});

class DashboardViewModel {
  activityDataProvider: CollectionDataProvider<any, any>;
  itemsDataProvider: CollectionDataProvider<any, any>;
  private activityCollection: Model.Collection;
  private itemCollection: Model.Collection;
  activityKey: number = 3;
  restServerURLBase = REST_URL;
  itemData: ko.Observable<any>;
  pieSeriesValue: ko.ObservableArray;
  selectedActivity = new ObservableKeySet();
  selectedItem = new ObservableKeySet();
  activitySelected = ko.observable(false);
  firstSelectedActivity = ko.observable();
  itemSelected = ko.observable(false);
  firstSelectedItem = ko.observable();
  dataFetched = ko.observable(true);
  inputItem: ko.Observable<any>;
  dialogMode: ko.Observable<string>;

  constructor() {
    this.activityCollection = new ActivityCollection();
    this.activityDataProvider = new CollectionDataProvider(
      this.activityCollection
    );
    this.itemCollection = new ItemCollection();
    this.itemCollection.url = REST_URL + this.activityKey + "/items/";
    this.itemsDataProvider = new CollectionDataProvider(this.itemCollection);
    this.itemData = ko.observable("");
    this.pieSeriesValue = ko.observableArray([{}]);
    this.inputItem = ko.observable({});
    this.dialogMode = ko.observable("view");
  }

  private openDialog(mode: string, data: any) {
    this.dialogMode(mode);
    this.inputItem(data);

    const dialogComponent = document.getElementById("itemActionDialog") as any;
    if (dialogComponent) {
      if (dialogComponent.open) {
        dialogComponent.open();
      } else {
        customElements.whenDefined("demo-update-item-dialog").then(() => {
          dialogComponent.open();
        });
      }
    }
  }

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

  public openEditDialog = () => {
    this.openDialog("edit", this.populateInputItem());
  };

  public openViewDialog = () => {
    this.openDialog("view", this.populateInputItem());
  };

  public openDeleteDialog = () => {
    this.openDialog("delete", this.populateInputItem());
  };

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

  public refreshItems = (event: any) => {
    this.itemCollection.fetch();

    if (this.dialogMode() === "edit" && event.detail && event.detail.data) {
      this.itemData(event.detail.data);
    }

    if (this.dialogMode() === "delete") {
      this.itemSelected(false);
      this.selectedItem.clear();
    }
  };

  selectedActivityChanged = (event: any) => {
    let itemContext = event.detail.value.data;
    if (itemContext != null) {
      this.activitySelected(false);
      this.activityKey = event.detail.value.data.id;
      this.itemCollection.url = REST_URL + this.activityKey + "/items/";
      this.itemCollection.fetch();
      this.activitySelected(true);
      this.itemSelected(false);
      this.selectedItem.clear();
      this.itemData();
    } else {
      this.activitySelected(false);
      this.itemSelected(false);
    }
  };

  selectedItemChanged = (event: any) => {
    let isClicked = event.detail.value.data;
    if (isClicked != null) {
      this.itemData(event.detail.value.data);
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

  connected(): void {
    AccUtils.announce("Dashboard page loaded.");
    document.title = "Dashboard";
  }

  disconnected(): void {}
  transitionCompleted(): void {}
}

export = DashboardViewModel;
