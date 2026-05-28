var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
define(["require", "exports", "knockout", "ojs/ojconverter-datetime", "ojs/ojconverterutils-i18n", "ojL10n!./resources/nls/demo-component-strings", "ojs/ojcontext", "ojs/ojarraydataprovider", "ojs/ojasyncvalidator-length", "", "ojs/ojavatar", "ojs/ojdatetimepicker", "ojs/ojformlayout", "ojs/ojinputtext", "ojs/ojknockout", "ojs/ojlabelvalue", "ojs/ojselectsingle"], function (require, exports, ko, ojconverter_datetime_1, ojconverterutils_i18n_1, componentStrings, Context, ArrayDataProvider, AsyncLengthValidator) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ko = __importStar(ko);
    class ViewModel {
        constructor(context) {
            this.status = [
                { value: "2", label: "todo" },
                { value: "3", label: "doing" },
                { value: "4", label: "blocked" },
                { value: "5", label: "done" },
            ];
            this.browsersDP = new ArrayDataProvider(this.status, {
                keyAttributes: "value",
            });
            this.getIdentifier = (componentId) => {
                return `${this.identifier}-${componentId}`;
            };
            this.startDateChanged = (event) => {
                this.properties.card.startDate = event.detail.value;
            };
            this.endDateChanged = (event) => {
                this.properties.card.endDate = event.detail.value;
            };
            this.statusChanged = (event) => {
                var _a;
                const statusId = Number(this.selectVal());
                const namesById = {
                    2: "todo",
                    3: "doing",
                    4: "blocked",
                    5: "done",
                };
                this.properties.card.status.id = statusId;
                this.properties.card.status.name = (_a = namesById[statusId]) !== null && _a !== void 0 ? _a : "todo";
                this.properties.card.status_id = statusId;
            };
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
            const elementContext = Context.getContext(context.element);
            const busyContext = elementContext.getBusyContext();
            const options = { description: "Web Component Startup - Waiting for data" };
            this.busyResolve = busyContext.addBusyState(options);
            this.composite = context.element;
            this.properties = context.properties;
            this.res = componentStrings["demo-component"];
            this.selectVal = ko.observable(this.properties.card.status.id + "");
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
            this.timeFullConverter = new ojconverter_datetime_1.IntlDateTimeConverter({
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            });
            this.initials = ojconverterutils_i18n_1.IntlConverterUtils.getInitials(this.properties.card.user.firstName, this.properties.card.user.lastName);
        }
        activated(context) { }
        connected(context) { }
        bindingsApplied(context) { }
        propertyChanged(context) {
            var _a, _b, _c;
            this.selectVal(((_c = (_b = (_a = this.properties.card.status) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : this.properties.card.status_id) !== null && _c !== void 0 ? _c : 2) + "");
        }
        disconnected(element) { }
    }
    exports.default = ViewModel;
});
//# sourceMappingURL=demo-component-viewModel.js.map