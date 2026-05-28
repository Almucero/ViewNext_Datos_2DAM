export type EditableProfile = {
    firstName: string;
    lastName: string;
    email: string;
};
export declare const isValidEmailFormat: (email: string | null | undefined) => boolean;
export declare const hasEmptyRequiredProfileFields: (profile: EditableProfile) => boolean;
export declare const hasOnlyAlphabeticNames: (profile: EditableProfile) => boolean;
export declare const hasProfileChanges: (original: EditableProfile, current: EditableProfile) => boolean;
