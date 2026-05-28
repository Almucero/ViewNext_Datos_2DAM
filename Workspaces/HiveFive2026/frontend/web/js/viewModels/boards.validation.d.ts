export type EditableCard = {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    priority: number | string;
    status_id?: number;
};
export declare const hasEmptyRequiredCardFields: (card: EditableCard) => boolean;
export declare const isCardPriorityValid: (priority: number | string | null | undefined) => boolean;
export declare const isCardDateRangeValid: (startDate: string, endDate: string) => boolean;
export declare const hasCardChanges: (original: EditableCard, current: EditableCard) => boolean;
