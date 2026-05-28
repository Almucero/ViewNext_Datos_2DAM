define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.hasCardChanges = exports.isCardDateRangeValid = exports.isCardPriorityValid = exports.hasEmptyRequiredCardFields = void 0;
    const normalize = (value) => (value || "").trim();
    const hasEmptyRequiredCardFields = (card) => {
        const priorityRaw = card.priority;
        const priorityText = priorityRaw === null || priorityRaw === undefined ? "" : String(priorityRaw).trim();
        return (!normalize(card.title) ||
            !normalize(card.description) ||
            !normalize(card.startDate) ||
            !normalize(card.endDate) ||
            priorityText === "");
    };
    exports.hasEmptyRequiredCardFields = hasEmptyRequiredCardFields;
    const isCardPriorityValid = (priority) => {
        const value = Number(priority);
        return Number.isInteger(value) && value >= 1 && value <= 9;
    };
    exports.isCardPriorityValid = isCardPriorityValid;
    const isCardDateRangeValid = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            return false;
        }
        return end.getTime() >= start.getTime();
    };
    exports.isCardDateRangeValid = isCardDateRangeValid;
    const hasCardChanges = (original, current) => {
        return (normalize(original.title) !== normalize(current.title) ||
            normalize(original.description) !== normalize(current.description) ||
            normalize(original.startDate) !== normalize(current.startDate) ||
            normalize(original.endDate) !== normalize(current.endDate) ||
            Number(original.priority) !== Number(current.priority) ||
            Number(original.status_id || 0) !== Number(current.status_id || 0));
    };
    exports.hasCardChanges = hasCardChanges;
});
//# sourceMappingURL=boards.validation.js.map