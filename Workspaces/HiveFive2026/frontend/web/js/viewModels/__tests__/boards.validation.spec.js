define(["require", "exports", "../boards.validation"], function (require, exports, boards_validation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe("boards card validation", () => {
        const baseCard = {
            title: "Implement login",
            description: "Crear pantalla login",
            startDate: "2026-04-10",
            endDate: "2026-04-12",
            priority: 1,
            status_id: 2,
        };
        it("requiere todos los campos de card rellenados", () => {
            expect((0, boards_validation_1.hasEmptyRequiredCardFields)(Object.assign(Object.assign({}, baseCard), { title: "" }))).to.equal(true);
            expect((0, boards_validation_1.hasEmptyRequiredCardFields)(Object.assign(Object.assign({}, baseCard), { description: "   " }))).to.equal(true);
            expect((0, boards_validation_1.hasEmptyRequiredCardFields)(Object.assign(Object.assign({}, baseCard), { startDate: "" }))).to.equal(true);
            expect((0, boards_validation_1.hasEmptyRequiredCardFields)(Object.assign(Object.assign({}, baseCard), { endDate: "" }))).to.equal(true);
            expect((0, boards_validation_1.hasEmptyRequiredCardFields)(Object.assign(Object.assign({}, baseCard), { priority: "" }))).to.equal(true);
            expect((0, boards_validation_1.hasEmptyRequiredCardFields)(baseCard)).to.equal(false);
        });
        it("valida rango de fechas (fin >= inicio)", () => {
            expect((0, boards_validation_1.isCardDateRangeValid)("2026-04-10", "2026-04-10")).to.equal(true);
            expect((0, boards_validation_1.isCardDateRangeValid)("2026-04-10", "2026-04-11")).to.equal(true);
            expect((0, boards_validation_1.isCardDateRangeValid)("2026-04-11", "2026-04-10")).to.equal(false);
        });
        it("valida prioridad entre 1 y 9", () => {
            expect((0, boards_validation_1.isCardPriorityValid)(1)).to.equal(true);
            expect((0, boards_validation_1.isCardPriorityValid)(9)).to.equal(true);
            expect((0, boards_validation_1.isCardPriorityValid)(0)).to.equal(false);
            expect((0, boards_validation_1.isCardPriorityValid)(10)).to.equal(false);
            expect((0, boards_validation_1.isCardPriorityValid)("abc")).to.equal(false);
            expect((0, boards_validation_1.isCardPriorityValid)(2.5)).to.equal(false);
        });
        it("en edición exige al menos un cambio", () => {
            expect((0, boards_validation_1.hasCardChanges)(baseCard, Object.assign({}, baseCard))).to.equal(false);
            expect((0, boards_validation_1.hasCardChanges)(baseCard, Object.assign(Object.assign({}, baseCard), { title: "Implement logout" }))).to.equal(true);
            expect((0, boards_validation_1.hasCardChanges)(baseCard, Object.assign(Object.assign({}, baseCard), { status_id: 3 }))).to.equal(true);
        });
    });
});
//# sourceMappingURL=boards.validation.spec.js.map