/**
 * Archivo: ts/jet-composites/demo-component/loader.ts
 * Proposito: Define logica de UI, estado observable, validaciones y llamadas async de este modulo.
 * Nota: Los comentarios priorizan flujo, side-effects y decisiones de integracion.
 */
import Composite = require("ojs/ojcomposite");
import * as view from "text!./demo-component-view.html";
import viewModel from "./demo-component-viewModel";
import * as metadata from "text!./component.json";
import "css!./demo-component-styles.css";

Composite.register("demo-component", {
  view: view,
  viewModel: viewModel,
  metadata: JSON.parse(metadata)
});

declare global {
  namespace preact.JSX {
    interface IntrinsicElements {
      "demo-component": any;
    }
  }
}