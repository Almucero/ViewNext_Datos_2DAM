define(["require", "exports", "../boardsList.validation"], function (require, exports, boardsList_validation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe("boardsList validation", () => {
        it("nombre de tablero no puede ir vacío", () => {
            expect((0, boardsList_validation_1.isBoardNameNotEmpty)("")).to.equal(false);
            expect((0, boardsList_validation_1.isBoardNameNotEmpty)("   ")).to.equal(false);
            expect((0, boardsList_validation_1.isBoardNameNotEmpty)("Sprint 1")).to.equal(true);
        });
        it("detecta si el nombre se ha cambiado", () => {
            expect((0, boardsList_validation_1.isBoardNameChanged)("Board A", "Board A")).to.equal(false);
            expect((0, boardsList_validation_1.isBoardNameChanged)("Board A", "Board B")).to.equal(true);
            expect((0, boardsList_validation_1.isBoardNameChanged)(" Board A ", "Board A")).to.equal(false);
        });
        it("solo permite borrar tableros sin cards", () => {
            expect((0, boardsList_validation_1.canDeleteBoard)(0)).to.equal(true);
            expect((0, boardsList_validation_1.canDeleteBoard)(1)).to.equal(false);
            expect((0, boardsList_validation_1.canDeleteBoard)(3)).to.equal(false);
        });
        it("normaliza espacios del nombre", () => {
            expect((0, boardsList_validation_1.normalizeBoardName)("  Kanban  ")).to.equal("Kanban");
        });
    });
});
//# sourceMappingURL=boardsList.validation.spec.js.map