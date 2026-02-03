/**
 * @license
 * Copyright (c) 2014, 2024, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */

"use strict";

// --- Importaciones ---
import * as ko from "knockout";
import { IntlNumberConverter } from "ojs/ojconverter-number";
import "ojs/ojformlayout";
import "ojs/ojinputtext";
import "ojs/ojknockout";
import "ojs/ojlabelvalue";
import * as ResponsiveKnockoutUtils from "ojs/ojresponsiveknockoututils";
import * as ResponsiveUtils from "ojs/ojresponsiveutils";
import componentStrings = require("ojL10n!./resources/nls/demo-update-item-strings");
import Context = require("ojs/ojcontext");
import Composite = require("ojs/ojcomposite");
import AsyncLengthValidator = require("ojs/ojasyncvalidator-length");
import ArrayDataProvider = require("ojs/ojarraydataprovider");

// --- ViewModel del Componente de Formulario ---
export default class ViewModel
  implements Composite.ViewModel<Composite.PropertiesType>
{
  // Contexto de carga.
  busyResolve: () => void;
  composite: Element;
  properties: Composite.PropertiesType;
  res: { [key: string]: string };

  // --- Diseño Responsivo ---
  // Detecta si la pantalla es pequeña (móvil) para ajustar el diseño del formulario.
  smallQuery = ResponsiveUtils.getFrameworkQuery(
    ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY
  );
  isSmall: ko.Observable = ResponsiveKnockoutUtils.createMediaQueryObservable(
    this.smallQuery!
  );

  // Calcula la posición de las etiquetas: 'top' para móviles, 'start' (izquierda) para escritorio.
  labelEdge: ko.Computed = ko.computed(() => {
    return this.isSmall() ? "top" : "start";
  }, this);

  // --- Utilidades de Formulario ---
  currency: IntlNumberConverter;
  numberConverter: IntlNumberConverter;
  validators: ko.ObservableArray<AsyncLengthValidator<string>>;

  // --- Gestión de Imágenes ---
  imageOptions: Array<{ value: string; label: string }>;
  imageOptionsDP: ArrayDataProvider<any, any>;
  imagePreview: ko.Observable<string | null>;
  handleImageChange: (event: any) => void;

  constructor(context: Composite.ViewModelContext<Composite.PropertiesType>) {
    // 1. Configuración del contexto de espera.
    const elementContext: Context = Context.getContext(context.element);
    const busyContext: Context.BusyContext = elementContext.getBusyContext();
    const options = { description: "Web Component Startup - Waiting for data" };
    this.busyResolve = busyContext.addBusyState(options);

    this.composite = context.element;
    this.properties = context.properties;
    this.res = componentStrings["demo-update-item"];

    // 2. Inicialización de Conversores (Moneda y Números).
    this.currency = new IntlNumberConverter({
      style: "currency",
      currency: "USD ",
      currencyDisplay: "code",
    });

    this.numberConverter = new IntlNumberConverter({
      style: "decimal",
    });

    // 3. Inicialización de Validadores.
    this.validators = ko.observableArray([
      new AsyncLengthValidator({ min: 5, max: 50 }),
    ]);

    // 4. Configuración de la Previsualización de Imagen.
    // Se inicializa con la imagen del item actual o null si no existe.
    this.imagePreview = ko.observable(this.properties.item?.itemImage || null);
    
    // Handler para actualizar la previsualización cuando el usuario selecciona una opción del dropdown.
    this.handleImageChange = (event) => {
      this.imagePreview(event.detail.value);
    };

    // 5. Definición de Opciones de Imagen (Static Data).
    this.imageOptions = [
      {
        value: "../../../css/images/product_images/jet_logo_256.png",
        label: "jet_logo_256",
      },
      {
        value: "../../../css/images/product_images/aceboot.jpg",
        label: "aceboot",
      },
      {
        value: "../../../css/images/product_images/acepole.jpg",
        label: "acepole",
      },
      {
        value: "../../../css/images/product_images/alglove.jpg",
        label: "alglove",
      },
      {
        value: "../../../css/images/product_images/baseball.jpg",
        label: "baseball",
      },
      {
        value: "../../../css/images/product_images/batterhelm.jpg",
        label: "batterhelm",
      },
      {
        value: "../../../css/images/product_images/bikehelmet.jpg",
        label: "bikerhelmet",
      },
      {
        value: "../../../css/images/product_images/bunboot.jpg",
        label: "bunboot",
      },
      {
        value: "../../../css/images/product_images/bunpole.jpg",
        label: "bunpole",
      },
      {
        value: "../../../css/images/product_images/cabbat.jpg",
        label: "cabbat",
      },
      {
        value: "../../../css/images/product_images/chaphelm.jpg",
        label: "chaphelm",
      },
      {
        value: "../../../css/images/product_images/elbowpads.jpg",
        label: "elbowpads",
      },
      {
        value: "../../../css/images/product_images/gpbike.jpg",
        label: "gpbike",
      },
      {
        value: "../../../css/images/product_images/grglove.jpg",
        label: "grglove",
      },
      {
        value: "../../../css/images/product_images/himbike.jpg",
        label: "himbike",
      },
      {
        value: "../../../css/images/product_images/jrsoccerball.jpg",
        label: "jrsoccerball",
      },
      {
        value: "../../../css/images/product_images/kneepads.jpg",
        label: "kneepads",
      },
      {
        value: "../../../css/images/product_images/mountainbiketire.jpg",
        label: "mountainbiketire",
      },
      {
        value: "../../../css/images/product_images/oracle.gif",
        label: "oracle",
      },
      {
        value: "../../../css/images/product_images/probar.jpg",
        label: "probar",
      },
      {
        value: "../../../css/images/product_images/proboot.jpg",
        label: "proboot",
      },
      {
        value: "../../../css/images/product_images/propole.jpg",
        label: "propole",
      },
      {
        value: "../../../css/images/product_images/pucbat.jpg",
        label: "pucbat",
      },
      {
        value: "../../../css/images/product_images/roadbiketire.jpg",
        label: "roadbiketire",
      },
      {
        value: "../../../css/images/product_images/safthelm.jpg",
        label: "safthelm",
      },
      {
        value: "../../../css/images/product_images/ski_boot.jpg",
        label: "ski_boot",
      },
      {
        value: "../../../css/images/product_images/soccernet.jpg",
        label: "soccernet",
      },
      {
        value: "../../../css/images/product_images/stglove.jpg",
        label: "stglove",
      },
      {
        value: "../../../css/images/product_images/tirepump.jpg",
        label: "tirepump",
      },
      {
        value: "../../../css/images/product_images/waterbottle.jpg",
        label: "waterbottle",
      },
      {
        value: "../../../css/images/product_images/winbat.jpg",
        label: "winbat",
      },
      {
        value: "../../../css/images/product_images/worldcupsoccerball.jpg",
        label: "worldcupsoocerball",
      },
    ];

    this.imageOptionsDP = new ArrayDataProvider(this.imageOptions, {
      keyAttributes: "value",
    });

    this.busyResolve();
  }

  // --- Ciclo de Vida ---
  
  // Detecta cambios en las propiedades pasadas desde el padre.
  propertyChanged(
    context: Composite.PropertyChangedContext<Composite.PropertiesType>
  ): void {
    // Si cambia el item (ej. al navegar en la lista), actualizamos la previsualización de la imagen.
    if (context.property === "item") {
      this.imagePreview(this.properties.item?.itemImage || null);
    }
  }
}