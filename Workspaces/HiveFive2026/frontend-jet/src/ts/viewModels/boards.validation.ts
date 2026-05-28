/**
 * Archivo: ts/viewModels/boards.validation.ts
 * Proposito: Define logica de UI, estado observable, validaciones y llamadas async de este modulo.
 * Nota: Los comentarios priorizan flujo, side-effects y decisiones de integracion.
 */
export type EditableCard = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  priority: number | string;
  status_id?: number;
};

const normalize = (value: string | null | undefined): string => (value || "").trim();

export const hasEmptyRequiredCardFields = (card: EditableCard): boolean => {
  const priorityRaw = card.priority as unknown;
  const priorityText =
    priorityRaw === null || priorityRaw === undefined ? "" : String(priorityRaw).trim();

  return (
    !normalize(card.title) ||
    !normalize(card.description) ||
    !normalize(card.startDate) ||
    !normalize(card.endDate) ||
    priorityText === ""
  );
};

export const isCardPriorityValid = (priority: number | string | null | undefined): boolean => {
  const value = Number(priority);
  return Number.isInteger(value) && value >= 1 && value <= 9;
};

export const isCardDateRangeValid = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return false;
  }

  return end.getTime() >= start.getTime();
};

export const hasCardChanges = (original: EditableCard, current: EditableCard): boolean => {
  return (
    normalize(original.title) !== normalize(current.title) ||
    normalize(original.description) !== normalize(current.description) ||
    normalize(original.startDate) !== normalize(current.startDate) ||
    normalize(original.endDate) !== normalize(current.endDate) ||
    Number(original.priority) !== Number(current.priority) ||
    Number(original.status_id || 0) !== Number(current.status_id || 0)
  );
};
