define(["require", "exports", "../login.validation"], function (require, exports, login_validation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe("login validation", () => {
        it("acepta emails válidos", () => {
            [
                "test@example.com",
                "user.name+tag@example.com",
                "user_name@example.co.uk",
                "user-name@sub.example.org",
            ].forEach((email) => {
                expect((0, login_validation_1.isValidLoginEmailFormat)(email)).to.equal(true, `Expected ${email} to be valid`);
            });
        });
        it("rechaza emails inválidos y puntos concatenados", () => {
            [
                "plainaddress",
                "@missingusername.com",
                "username@.com",
                "username@com",
                "user..name@example.com",
                "username@domain..com",
            ].forEach((email) => {
                expect((0, login_validation_1.isValidLoginEmailFormat)(email)).to.equal(false, `Expected ${email} to be invalid`);
            });
        });
    });
});
//# sourceMappingURL=login.validation.spec.js.map