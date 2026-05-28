export declare const normalizeBoardName: (value: string | null | undefined) => string;
export declare const isBoardNameNotEmpty: (value: string | null | undefined) => boolean;
export declare const isBoardNameChanged: (originalName: string | null | undefined, nextName: string | null | undefined) => boolean;
export declare const canDeleteBoard: (boardCardCount: number) => boolean;
