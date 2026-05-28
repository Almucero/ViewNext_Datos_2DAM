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
define(["require", "exports", "ojs/ojcomposite", "text!./demo-component-view.html", "./demo-component-viewModel", "text!./component.json", "css!./demo-component-styles.css"], function (require, exports, Composite, view, demo_component_viewModel_1, metadata) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    view = __importStar(view);
    demo_component_viewModel_1 = __importDefault(demo_component_viewModel_1);
    metadata = __importStar(metadata);
    Composite.register("demo-component", {
        view: view,
        viewModel: demo_component_viewModel_1.default,
        metadata: JSON.parse(metadata)
    });
});
//# sourceMappingURL=loader.js.map