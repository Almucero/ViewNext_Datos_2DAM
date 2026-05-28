define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.hasProfileChanges = exports.hasOnlyAlphabeticNames = exports.hasEmptyRequiredProfileFields = exports.isValidEmailFormat = void 0;
    const normalize = (value) => (value || "").trim();
    const isValidEmailFormat = (email) => {
        const value = normalize(email);
        if (!value)
            return false;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return false;
        }
        const [localPart, domainPart] = value.split("@");
        if (!localPart || !domainPart)
            return false;
        if (localPart.includes("..") || domainPart.includes("..")) {
            return false;
        }
        if (localPart.startsWith(".") ||
            localPart.endsWith(".") ||
            domainPart.startsWith(".") ||
            domainPart.endsWith(".")) {
            return false;
        }
        const domainSections = domainPart.split(".");
        if (domainSections.some((section) => section.length === 0))
            return false;
        const tld = domainSections[domainSections.length - 1];
        if (!/^[A-Za-z]{2,}$/.test(tld))
            return false;
        return true;
    };
    exports.isValidEmailFormat = isValidEmailFormat;
    const hasEmptyRequiredProfileFields = (profile) => {
        return !normalize(profile.firstName) || !normalize(profile.lastName) || !normalize(profile.email);
    };
    exports.hasEmptyRequiredProfileFields = hasEmptyRequiredProfileFields;
    const hasOnlyAlphabeticNames = (profile) => {
        const firstName = normalize(profile.firstName);
        const lastName = normalize(profile.lastName);
        const alphaOnly = /^[A-Za-zÑñÁÉÍÓÚáéíóú]+$/;
        return alphaOnly.test(firstName) && alphaOnly.test(lastName);
    };
    exports.hasOnlyAlphabeticNames = hasOnlyAlphabeticNames;
    const hasProfileChanges = (original, current) => {
        return (normalize(original.firstName) !== normalize(current.firstName) ||
            normalize(original.lastName) !== normalize(current.lastName) ||
            normalize(original.email) !== normalize(current.email));
    };
    exports.hasProfileChanges = hasProfileChanges;
});
//# sourceMappingURL=profile.validation.js.map