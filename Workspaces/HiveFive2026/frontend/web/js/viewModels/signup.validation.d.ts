export type SignupData = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};
export declare const hasEmptyRequiredSignupFields: (signupData: SignupData) => boolean;
export declare const hasOnlyAlphabeticNames: (signupData: SignupData) => boolean;
