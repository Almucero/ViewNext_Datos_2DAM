/**
 * Archivo: ts/viewModels/__tests__/login.validation.spec.ts
 * Proposito: Define logica de UI, estado observable, validaciones y llamadas async de este modulo.
 * Nota: Los comentarios priorizan flujo, side-effects y decisiones de integracion.
 */
/// <reference types="mocha" />
/// <reference types="chai" />

import { isValidLoginEmailFormat } from "../login.validation";

export {};

declare const expect: Chai.ExpectStatic;

describe("login validation", () => {
  it("acepta emails válidos", () => {
    [
      "test@example.com",
      "user.name+tag@example.com",
      "user_name@example.co.uk",
      "user-name@sub.example.org",
    ].forEach((email) => {
      expect(isValidLoginEmailFormat(email)).to.equal(true, `Expected ${email} to be valid`);
    });
  });

  it("rechaza emails inválidos y puntos concatenados", () => {
    [
      "plainaddress",
      "@missingusername.com",
      "username@.com",
      "username@com",
      "user..name@example.com",
      "username@domain..com",
    ].forEach((email) => {
      expect(isValidLoginEmailFormat(email)).to.equal(false, `Expected ${email} to be invalid`);
    });
  });

  it("tolera espacios exteriores y rechaza variantes incompletas", () => {
    [" test@example.com", "test@example.com "].forEach((email) => {
      expect(isValidLoginEmailFormat(email)).to.equal(true, `Expected ${email} to be valid`);
    });

    [
      "test @example.com",
      "test@ example.com",
      "test@example",
      "test@.example.com",
    ].forEach((email) => {
      expect(isValidLoginEmailFormat(email)).to.equal(false, `Expected ${email} to be invalid`);
    });
  });
});
