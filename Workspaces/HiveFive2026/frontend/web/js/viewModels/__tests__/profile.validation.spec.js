define(["require", "exports", "../profile.validation"], function (require, exports, profile_validation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe("profile validation", () => {
        const base = {
            firstName: "Ana",
            lastName: "Lopez",
            email: "ana@hive5.com",
        };
        it("detecta campos obligatorios vacíos", () => {
            expect((0, profile_validation_1.hasEmptyRequiredProfileFields)(Object.assign(Object.assign({}, base), { firstName: "" }))).to.equal(true);
            expect((0, profile_validation_1.hasEmptyRequiredProfileFields)(Object.assign(Object.assign({}, base), { lastName: "   " }))).to.equal(true);
            expect((0, profile_validation_1.hasEmptyRequiredProfileFields)(Object.assign(Object.assign({}, base), { email: "" }))).to.equal(true);
            expect((0, profile_validation_1.hasEmptyRequiredProfileFields)(base)).to.equal(false);
        });
        it("requiere al menos un cambio para actualizar", () => {
            expect((0, profile_validation_1.hasProfileChanges)(base, Object.assign({}, base))).to.equal(false);
            expect((0, profile_validation_1.hasProfileChanges)(base, Object.assign(Object.assign({}, base), { firstName: "Maria" }))).to.equal(true);
            expect((0, profile_validation_1.hasProfileChanges)(base, Object.assign(Object.assign({}, base), { email: "maria@hive5.com" }))).to.equal(true);
        });
        it("permite solo letras en nombre y apellidos", () => {
            expect((0, profile_validation_1.hasOnlyAlphabeticNames)(Object.assign(Object.assign({}, base), { firstName: "Ana", lastName: "Lopez" }))).to.equal(true);
            expect((0, profile_validation_1.hasOnlyAlphabeticNames)(Object.assign(Object.assign({}, base), { firstName: "Iñaki", lastName: "Peña" }))).to.equal(true);
            expect((0, profile_validation_1.hasOnlyAlphabeticNames)(Object.assign(Object.assign({}, base), { firstName: "Álvaro", lastName: "Gómez" }))).to.equal(true);
            expect((0, profile_validation_1.hasOnlyAlphabeticNames)(Object.assign(Object.assign({}, base), { firstName: "Ana3" }))).to.equal(false);
            expect((0, profile_validation_1.hasOnlyAlphabeticNames)(Object.assign(Object.assign({}, base), { lastName: "Lopez-Garcia" }))).to.equal(false);
            expect((0, profile_validation_1.hasOnlyAlphabeticNames)(Object.assign(Object.assign({}, base), { lastName: "O'Connor" }))).to.equal(false);
            expect((0, profile_validation_1.hasOnlyAlphabeticNames)(Object.assign(Object.assign({}, base), { firstName: "Ana Maria" }))).to.equal(false);
            expect((0, profile_validation_1.hasOnlyAlphabeticNames)(Object.assign(Object.assign({}, base), { lastName: "" }))).to.equal(false);
        });
        it("valida formato email y bloquea puntos concatenados", () => {
            const validEmails = [
                "test@example.com",
                "user.name+tag+sorting@example.com",
                "user_name@example.co.uk",
                "user-name@sub.example.org",
            ];
            const invalidEmails = [
                "plainaddress",
                "@missingusername.com",
                "username@.com",
                "username@com",
                "user....name@example.com",
                "username@domain..com",
            ];
            validEmails.forEach((email) => {
                expect((0, profile_validation_1.isValidEmailFormat)(email)).to.equal(true, `Expected ${email} to be valid`);
            });
            invalidEmails.forEach((email) => {
                expect((0, profile_validation_1.isValidEmailFormat)(email)).to.equal(false, `Expected ${email} to be invalid`);
            });
        });
    });
});
//# sourceMappingURL=profile.validation.spec.js.map