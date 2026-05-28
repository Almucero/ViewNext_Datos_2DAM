/**
 * Archivo: ts/viewModels/__tests__/boards.validation.spec.ts
 * Proposito: Define logica de UI, estado observable, validaciones y llamadas async de este modulo.
 * Nota: Los comentarios priorizan flujo, side-effects y decisiones de integracion.
 */
/// <reference types="mocha" />
/// <reference types="chai" />

import {
  hasCardChanges,
  hasEmptyRequiredCardFields,
  isCardPriorityValid,
  isCardDateRangeValid,
  type EditableCard,
} from "../boards.validation";

export {};

declare const expect: Chai.ExpectStatic;

describe("boards card validation", () => {
  const baseCard: EditableCard = {
    title: "Implement login",
    description: "Crear pantalla login",
    startDate: "2026-04-10",
    endDate: "2026-04-12",
    priority: 1,
    status_id: 2,
  };

  it("requiere todos los campos de card rellenados", () => {
    expect(hasEmptyRequiredCardFields({ ...baseCard, title: "" })).to.equal(true);
    expect(hasEmptyRequiredCardFields({ ...baseCard, description: "   " })).to.equal(true);
    expect(hasEmptyRequiredCardFields({ ...baseCard, startDate: "" })).to.equal(true);
    expect(hasEmptyRequiredCardFields({ ...baseCard, endDate: "" })).to.equal(true);
    expect(hasEmptyRequiredCardFields({ ...baseCard, priority: "" })).to.equal(true);
    expect(hasEmptyRequiredCardFields(baseCard)).to.equal(false);
  });

  it("valida rango de fechas (fin >= inicio)", () => {
    expect(isCardDateRangeValid("2026-04-10", "2026-04-10")).to.equal(true);
    expect(isCardDateRangeValid("2026-04-10", "2026-04-11")).to.equal(true);
    expect(isCardDateRangeValid("2026-04-11", "2026-04-10")).to.equal(false);
  });

  it("valida prioridad entre 1 y 9", () => {
    expect(isCardPriorityValid(1)).to.equal(true);
    expect(isCardPriorityValid(9)).to.equal(true);
    expect(isCardPriorityValid(0)).to.equal(false);
    expect(isCardPriorityValid(10)).to.equal(false);
    expect(isCardPriorityValid("abc")).to.equal(false);
    expect(isCardPriorityValid(2.5)).to.equal(false);
  });

  it("en edición exige al menos un cambio", () => {
    expect(hasCardChanges(baseCard, { ...baseCard })).to.equal(false);
    expect(hasCardChanges(baseCard, { ...baseCard, title: "Implement logout" })).to.equal(true);
    expect(hasCardChanges(baseCard, { ...baseCard, status_id: 3 })).to.equal(true);
  });
});
