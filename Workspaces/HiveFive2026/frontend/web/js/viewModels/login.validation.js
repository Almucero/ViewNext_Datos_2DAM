define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isValidLoginEmailFormat = void 0;
    const normalize = (value) => (value || "").trim();
    const isValidLoginEmailFormat = (email) => {
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
    exports.isValidLoginEmailFormat = isValidLoginEmailFormat;
});
//# sourceMappingURL=login.validation.js.map