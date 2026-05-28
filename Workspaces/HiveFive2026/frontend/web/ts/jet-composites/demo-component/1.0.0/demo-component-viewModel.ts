/**
 * Archivo: ts/jet-composites/demo-component/demo-component-viewModel.ts
 * Proposito: Define logica de UI, estado observable, validaciones y llamadas async de este modulo.
 * Nota: Los comentarios priorizan flujo, side-effects y decisiones de integracion.
 */
"use strict";

import "";
import * as ko from "knockout";
import "ojs/ojavatar";
import { IntlDateTimeConverter } from "ojs/ojconverter-datetime";
import { IntlConverterUtils } from "ojs/ojconverterutils-i18n";
import "ojs/ojdatetimepicker";
import { ojDatePicker } from "ojs/ojdatetimepicker";
import "ojs/ojformlayout";
import "ojs/ojinputtext";
import "ojs/ojknockout";
import "ojs/ojlabelvalue";
import "ojs/ojselectsingle";
import componentStrings = require("ojL10n!./resources/nls/demo-component-strings");
import Context = require("ojs/ojcontext");
import Composite = require("ojs/ojcomposite");
import ArrayDataProvider = require("ojs/ojarraydataprovider");

import AsyncLengthValidator = require("ojs/ojasyncvalidator-length");

export default class ViewModel
  implements Composite.ViewModel<Composite.PropertiesType>
{
  lengthValue1: ko.Observable<string>;
  validatorTitle: ko.ObservableArray<AsyncLengthValidator<string>>;
  validatorDesc: ko.ObservableArray<AsyncLengthValidator<string>>;
  validatorPriority: ko.ObservableArray<AsyncLengthValidator<string>>;
  identifier: string;
  busyResolve: () => void;
  composite: Element;
  properties: Composite.PropertiesType;
  res: { [key: string]: string };

  timeFullConverter: IntlDateTimeConverter;
  value: ko.Observable<string>;
  numberOfMonths: number;
  datePickerMonths: ojDatePicker["datePicker"];
  datePickerWeek: ojDatePicker["datePicker"];
  timePicker: object;

  // Selector de status
  selectVal: ko.Observable<string>;
  //readonly selectVal: ko.Observable<string> = .card.status.name;
  private readonly status = [
    { value: "2", label: "todo" },
    { value: "3", label: "doing" },
    { value: "4", label: "blocked" },
    { value: "5", label: "done" },
  ];

  readonly browsersDP = new ArrayDataProvider(this.status, {
    keyAttributes: "value",
  });

  // Icono del perfil de los usuarios
  initials: string | undefined;
  // Inicializa observables, adapta datos de sesion y dispara cargas iniciales.
  constructor(context: Composite.ViewModelContext<Composite.PropertiesType>) {
    this.lengthValue1 = ko.observable("");
    this.validatorTitle = ko.observableArray([
      new AsyncLengthValidator({ min: 4, max: 30 }),
    ]);

    this.validatorDesc = ko.observableArray([
      new AsyncLengthValidator({ min: 8, max: 50 }),
    ]);

    this.validatorPriority = ko.observableArray([
      new AsyncLengthValidator({ min: 1, max: 1 }),
    ]);

    this.value = ko.observable("2022-12-20T10:00:00Z");
    this.identifier = context.uniqueId;
    //At the start of your viewModel constructor
    const elementContext: Context = Context.getContext(context.element);
    const busyContext: Context.BusyContext = elementContext.getBusyContext();
    const options = { description: "Web Component Startup - Waiting for data" };
    this.busyResolve = busyContext.addBusyState(options);

    this.composite = context.element;

    //Example observable
    this.properties = context.properties;
    this.res = componentStrings["demo-component"];
    // Example for parsing context properties
    // if (context.properties.name) {
    //     parse the context properties here
    // }

    this.selectVal = ko.observable(this.properties.card.status.id + "");

    //Once all startup and async activities have finished, relocate if there are any async activities
    this.busyResolve();

    this.numberOfMonths = 1;

    this.datePickerMonths = {
      numberOfMonths: this.numberOfMonths,
    };

    this.datePickerWeek = {
      weekDisplay: "number",
    };

    this.timePicker = {
      timeIncrement: "00:15:00:00",
    };
    this.timeFullConverter = new IntlDateTimeConverter({
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // conseguir los dos letras para el icono del perfil
    this.initials = IntlConverterUtils.getInitials(
      this.properties.card.user.firstName,
      this.properties.card.user.lastName
    );
  }

  public getIdentifier = (componentId: string) => {
    return `${this.identifier}-${componentId}`;
  };

  startDateChanged = (event: any) => {
    this.properties.card.startDate = event.detail.value;
  };

  endDateChanged = (event: any) => {
    this.properties.card.endDate = event.detail.value;
  };

  statusChanged = (event: any) => {
    const statusId = Number(this.selectVal());
    const namesById: { [key: number]: string } = {
      2: "todo",
      3: "doing",
      4: "blocked",
      5: "done",
    };

    this.properties.card.status.id = statusId;
    this.properties.card.status.name = namesById[statusId] ?? "todo";
    this.properties.card.status_id = statusId;
  };

  //Lifecycle methods - implement if necessary

  activated(
    context: Composite.ViewModelContext<Composite.PropertiesType>
  ): Promise<any> | void {}

  connected(
    context: Composite.ViewModelContext<Composite.PropertiesType>
  ): void {}

  bindingsApplied(
    context: Composite.ViewModelContext<Composite.PropertiesType>
  ): void {}

  propertyChanged(
    context: Composite.PropertyChangedContext<Composite.PropertiesType>
  ): void {
    this.selectVal((this.properties.card.status?.id ?? this.properties.card.status_id ?? 2) + "");
  }

  disconnected(element: Element): void {}
}
