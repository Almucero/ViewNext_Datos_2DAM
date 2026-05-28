/**
 * Archivo: ts/viewModels/__tests__/profile.validation.spec.ts
 * Proposito: Define logica de UI, estado observable, validaciones y llamadas async de este modulo.
 * Nota: Los comentarios priorizan flujo, side-effects y decisiones de integracion.
 */
/// <reference types="mocha" />
/// <reference types="chai" />

import {
  hasOnlyAlphabeticNames,
  hasEmptyRequiredProfileFields,
  hasProfileChanges,
  isValidEmailFormat,
  type EditableProfile,
} from "../profile.validation";

export { };

declare const expect: Chai.ExpectStatic;

describe("profile validation", () => {
  const base: EditableProfile = {
    firstName: "Ana",
    lastName: "Lopez",
    email: "ana@hive5.com",
  };

  it("detecta campos obligatorios vacíos", () => {
    expect(hasEmptyRequiredProfileFields({ ...base, firstName: "" })).to.equal(true);
    expect(hasEmptyRequiredProfileFields({ ...base, lastName: "   " })).to.equal(true);
    expect(hasEmptyRequiredProfileFields({ ...base, email: "" })).to.equal(true);
    expect(hasEmptyRequiredProfileFields(base)).to.equal(false);
  });

  it("requiere al menos un cambio para actualizar", () => {
    expect(hasProfileChanges(base, { ...base })).to.equal(false);
    expect(hasProfileChanges(base, { ...base, firstName: "Maria" })).to.equal(true);
    expect(hasProfileChanges(base, { ...base, email: "maria@hive5.com" })).to.equal(true);
  });

  it("permite solo letras en nombre y apellidos", () => {
    expect(hasOnlyAlphabeticNames({ ...base, firstName: "Ana", lastName: "Lopez" })).to.equal(true);
    expect(hasOnlyAlphabeticNames({ ...base, firstName: "Iñaki", lastName: "Peña" })).to.equal(true);
    expect(hasOnlyAlphabeticNames({ ...base, firstName: "Álvaro", lastName: "Gómez" })).to.equal(true);
    expect(hasOnlyAlphabeticNames({ ...base, firstName: "Ana3" })).to.equal(false);
    expect(hasOnlyAlphabeticNames({ ...base, lastName: "Lopez-Garcia" })).to.equal(false);
    expect(hasOnlyAlphabeticNames({ ...base, lastName: "O'Connor" })).to.equal(false);
    expect(hasOnlyAlphabeticNames({ ...base, firstName: "Ana Maria" })).to.equal(false);
    expect(hasOnlyAlphabeticNames({ ...base, lastName: "" })).to.equal(false);
  });

  it("valida formato email y bloquea puntos concatenados", () => {
    const validEmails = [
      "test@example.com",
      "user.name+tag+sorting@example.com",
      "user_name@example.co.uk",
      "user-name@sub.example.org",
    ];
    const invalidEmails = [
      "plainaddress",
      "@missingusername.com",
      "username@.com",
      "username@com",
      "user....name@example.com",
      "username@domain..com",
    ];

    validEmails.forEach((email) => {
      expect(isValidEmailFormat(email)).to.equal(true, `Expected ${email} to be valid`);
    });

    invalidEmails.forEach((email) => {
      expect(isValidEmailFormat(email)).to.equal(false, `Expected ${email} to be invalid`);
    });
  });
});
