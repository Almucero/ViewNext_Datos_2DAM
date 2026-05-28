define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.canDeleteBoard = exports.isBoardNameChanged = exports.isBoardNameNotEmpty = exports.normalizeBoardName = void 0;
    const normalizeBoardName = (value) => {
        return (value || "").trim();
    };
    exports.normalizeBoardName = normalizeBoardName;
    const isBoardNameNotEmpty = (value) => {
        return (0, exports.normalizeBoardName)(value).length > 0;
    };
    exports.isBoardNameNotEmpty = isBoardNameNotEmpty;
    const isBoardNameChanged = (originalName, nextName) => {
        return (0, exports.normalizeBoardName)(originalName) !== (0, exports.normalizeBoardName)(nextName);
    };
    exports.isBoardNameChanged = isBoardNameChanged;
    const canDeleteBoard = (boardCardCount) => {
        return Number(boardCardCount) === 0;
    };
    exports.canDeleteBoard = canDeleteBoard;
});
//# sourceMappingURL=boardsList.validation.js.map