/**
 * Archivo: ts/viewModels/profile.validation.ts
 * Proposito: Define logica de UI, estado observable, validaciones y llamadas async de este modulo.
 * Nota: Los comentarios priorizan flujo, side-effects y decisiones de integracion.
 */
export type EditableProfile = {
  firstName: string;
  lastName: string;
  email: string;
};

const normalize = (value: string | null | undefined): string => (value || "").trim();

export const isValidEmailFormat = (email: string | null | undefined): boolean => {
  const value = normalize(email);
  if (!value) return false;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return false;
  }

  const [localPart, domainPart] = value.split("@");
  if (!localPart || !domainPart) return false;

  if (localPart.includes("..") || domainPart.includes("..")) {
    return false;
  }

  if (
    localPart.startsWith(".") ||
    localPart.endsWith(".") ||
    domainPart.startsWith(".") ||
    domainPart.endsWith(".")
  ) {
    return false;
  }

  const domainSections = domainPart.split(".");
  if (domainSections.some((section) => section.length === 0)) return false;
  const tld = domainSections[domainSections.length - 1];
  if (!/^[A-Za-z]{2,}$/.test(tld)) return false;

  return true;
};

export const hasEmptyRequiredProfileFields = (profile: EditableProfile): boolean => {
  return !normalize(profile.firstName) || !normalize(profile.lastName) || !normalize(profile.email);
};

export const hasOnlyAlphabeticNames = (profile: EditableProfile): boolean => {
  const firstName = normalize(profile.firstName);
  const lastName = normalize(profile.lastName);
  const alphaOnly = /^[A-Za-zÑñÁÉÍÓÚáéíóú]+$/;

  return alphaOnly.test(firstName) && alphaOnly.test(lastName);
};

export const hasProfileChanges = (original: EditableProfile, current: EditableProfile): boolean => {
  return (
    normalize(original.firstName) !== normalize(current.firstName) ||
    normalize(original.lastName) !== normalize(current.lastName) ||
    normalize(original.email) !== normalize(current.email)
  );
};
