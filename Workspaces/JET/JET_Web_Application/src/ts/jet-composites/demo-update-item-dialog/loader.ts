import Composite = require("ojs/ojcomposite");
import * as view from "text!./demo-update-item-dialog-view.html";
import viewModel from "./demo-update-item-dialog-viewModel";
import * as metadata from "text!./component.json";
import "css!./demo-update-item-dialog-styles.css";

Composite.register("demo-update-item-dialog", {
  view: view,
  viewModel: viewModel,
  metadata: JSON.parse(metadata)
});

declare global {
  namespace preact.JSX {
    interface IntrinsicElements {
      "demo-update-item-dialog": any;
    }
  }
}