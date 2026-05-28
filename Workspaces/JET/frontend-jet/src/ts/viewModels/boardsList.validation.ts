/**
 * Archivo: ts/viewModels/boardsList.validation.ts
 * Proposito: Define logica de UI, estado observable, validaciones y llamadas async de este modulo.
 * Nota: Los comentarios priorizan flujo, side-effects y decisiones de integracion.
 */
export const normalizeBoardName = (value: string | null | undefined): string => {
  return (value || "").trim();
};

export const isBoardNameNotEmpty = (value: string | null | undefined): boolean => {
  return normalizeBoardName(value).length > 0;
};

export const isBoardNameChanged = (
  originalName: string | null | undefined,
  nextName: string | null | undefined
): boolean => {
  return normalizeBoardName(originalName) !== normalizeBoardName(nextName);
};

export const canDeleteBoard = (boardCardCount: number): boolean => {
  return Number(boardCardCount) === 0;
};
