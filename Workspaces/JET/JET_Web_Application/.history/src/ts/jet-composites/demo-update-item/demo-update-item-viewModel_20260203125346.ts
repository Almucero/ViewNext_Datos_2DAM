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
import imageOptionsData = require("text!./imageOptions.json");

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

    // 5. Definición de Opciones de Imagen.
    this.imageOptions = imageOptionsData as any;

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