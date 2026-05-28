/// <reference types="ojasyncvalidator-length" />
/// <reference types="ojarraydataprovider" />
import "";
import * as ko from "knockout";
import "ojs/ojavatar";
import { IntlDateTimeConverter } from "ojs/ojconverter-datetime";
import "ojs/ojdatetimepicker";
import { ojDatePicker } from "ojs/ojdatetimepicker";
import "ojs/ojformlayout";
import "ojs/ojinputtext";
import "ojs/ojknockout";
import "ojs/ojlabelvalue";
import "ojs/ojselectsingle";
import Composite = require("ojs/ojcomposite");
import ArrayDataProvider = require("ojs/ojarraydataprovider");
import AsyncLengthValidator = require("ojs/ojasyncvalidator-length");
export default class ViewModel implements Composite.ViewModel<Composite.PropertiesType> {
    lengthValue1: ko.Observable<string>;
    validatorTitle: ko.ObservableArray<AsyncLengthValidator<string>>;
    validatorDesc: ko.ObservableArray<AsyncLengthValidator<string>>;
    validatorPriority: ko.ObservableArray<AsyncLengthValidator<string>>;
    identifier: string;
    busyResolve: () => void;
    composite: Element;
    properties: Composite.PropertiesType;
    res: {
        [key: string]: string;
    };
    timeFullConverter: IntlDateTimeConverter;
    value: ko.Observable<string>;
    numberOfMonths: number;
    datePickerMonths: ojDatePicker["datePicker"];
    datePickerWeek: ojDatePicker["datePicker"];
    timePicker: object;
    selectVal: ko.Observable<string>;
    private readonly status;
    readonly browsersDP: ArrayDataProvider<unknown, unknown>;
    initials: string | undefined;
    constructor(context: Composite.ViewModelContext<Composite.PropertiesType>);
    getIdentifier: (componentId: string) => string;
    startDateChanged: (event: any) => void;
    endDateChanged: (event: any) => void;
    statusChanged: (event: any) => void;
    activated(context: Composite.ViewModelContext<Composite.PropertiesType>): Promise<any> | void;
    connected(context: Composite.ViewModelContext<Composite.PropertiesType>): void;
    bindingsApplied(context: Composite.ViewModelContext<Composite.PropertiesType>): void;
    propertyChanged(context: Composite.PropertyChangedContext<Composite.PropertiesType>): void;
    disconnected(element: Element): void;
}
