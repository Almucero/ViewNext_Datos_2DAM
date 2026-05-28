define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.hasOnlyAlphabeticNames = exports.hasEmptyRequiredSignupFields = void 0;
    const normalize = (value) => (value || "").trim();
    const hasEmptyRequiredSignupFields = (signupData) => {
        return (!normalize(signupData.firstName) ||
            !normalize(signupData.lastName) ||
            !normalize(signupData.email) ||
            !normalize(signupData.password));
    };
    exports.hasEmptyRequiredSignupFields = hasEmptyRequiredSignupFields;
    const hasOnlyAlphabeticNames = (signupData) => {
        const firstName = normalize(signupData.firstName);
        const lastName = normalize(signupData.lastName);
        const alphaOnly = /^[A-Za-z\u00D1\u00F1\u00C1\u00C9\u00CD\u00D3\u00DA\u00E1\u00E9\u00ED\u00F3\u00FA\s'-]+$/;
        return alphaOnly.test(firstName) && alphaOnly.test(lastName);
    };
    exports.hasOnlyAlphabeticNames = hasOnlyAlphabeticNames;
});
//# sourceMappingURL=signup.validation.js.map