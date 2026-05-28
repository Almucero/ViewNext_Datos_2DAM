/**
 * Archivo: ts/viewModels/__tests__/boardsList.validation.spec.ts
 * Proposito: Define logica de UI, estado observable, validaciones y llamadas async de este modulo.
 * Nota: Los comentarios priorizan flujo, side-effects y decisiones de integracion.
 */
/// <reference types="mocha" />
/// <reference types="chai" />

import {
  canDeleteBoard,
  isBoardNameChanged,
  isBoardNameNotEmpty,
  normalizeBoardName,
} from "../boardsList.validation";

export {};

declare const expect: Chai.ExpectStatic;

describe("boardsList validation", () => {
  it("nombre de tablero no puede ir vacío", () => {
    expect(isBoardNameNotEmpty("")).to.equal(false);
    expect(isBoardNameNotEmpty("   ")).to.equal(false);
    expect(isBoardNameNotEmpty("Sprint 1")).to.equal(true);
  });

  it("detecta si el nombre se ha cambiado", () => {
    expect(isBoardNameChanged("Board A", "Board A")).to.equal(false);
    expect(isBoardNameChanged("Board A", "Board B")).to.equal(true);
    expect(isBoardNameChanged(" Board A ", "Board A")).to.equal(false);
  });

  it("solo permite borrar tableros sin cards", () => {
    expect(canDeleteBoard(0)).to.equal(true);
    expect(canDeleteBoard(1)).to.equal(false);
    expect(canDeleteBoard(3)).to.equal(false);
  });

  it("normaliza espacios del nombre", () => {
    expect(normalizeBoardName("  Kanban  ")).to.equal("Kanban");
  });
});
