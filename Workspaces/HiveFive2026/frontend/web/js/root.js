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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "knockout", "ojs/ojbootstrap", "./appController", "ojs/ojbutton", "ojs/ojknockout", "ojs/ojmodule", "ojs/ojnavigationlist", "ojs/ojselectsingle", "ojs/ojtoolbar"], function (require, exports, ko, ojbootstrap_1, appController_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ko = __importStar(ko);
    appController_1 = __importDefault(appController_1);
    function init() {
        ko.applyBindings(appController_1.default, document.getElementById("globalBody"));
    }
    (0, ojbootstrap_1.whenDocumentReady)().then(function () {
        if (document.body.classList.contains("oj-hybrid")) {
            document.addEventListener("deviceready", init);
        }
        else {
            init();
        }
    });
});
//# sourceMappingURL=root.js.map