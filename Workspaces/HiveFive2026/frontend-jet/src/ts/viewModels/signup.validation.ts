/**
 * Archivo: ts/viewModels/signup.validation.ts
 * Proposito: Define logica de UI, estado observable, validaciones y llamadas async de este modulo.
 * Nota: Los comentarios priorizan flujo, side-effects y decisiones de integracion.
 */
const normalize = (value: string | null | undefined): string => (value || "").trim();

export type SignupData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export const hasEmptyRequiredSignupFields = (signupData: SignupData): boolean => {
  return (
    !normalize(signupData.firstName) ||
    !normalize(signupData.lastName) ||
    !normalize(signupData.email) ||
    !normalize(signupData.password)
  );
};

export const hasOnlyAlphabeticNames = (signupData: SignupData): boolean => {
  const firstName = normalize(signupData.firstName);
  const lastName = normalize(signupData.lastName);
  const alphaOnly = /^[A-Za-z\u00D1\u00F1\u00C1\u00C9\u00CD\u00D3\u00DA\u00E1\u00E9\u00ED\u00F3\u00FA\s'-]+$/;

  return alphaOnly.test(firstName) && alphaOnly.test(lastName);
};
