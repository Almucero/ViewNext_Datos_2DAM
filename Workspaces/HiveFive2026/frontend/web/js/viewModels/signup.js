"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function showLogAlert(message, backgroundColor) {
    const alertDiv = document.createElement("div");
    alertDiv.className = "custom-log-alert";
    alertDiv.textContent = message;
    alertDiv.style.backgroundColor = backgroundColor;
    document.body.appendChild(alertDiv);
    window.setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 2000);
}
define(["require", "exports", "knockout", "viewModels/login.validation", "viewModels/signup.validation"], function (require, exports, ko, loginValidation, signupValidation) {
    class SignupViewModel {
        constructor() {
            this.user = {
                firstName: ko.observable(""),
                lastName: ko.observable(""),
                email: ko.observable(""),
                password: ko.observable("")
            };
            this.mensaje = ko.observable("");
            this.isSubmitting = ko.observable(false);
            this.t = (key) => {
                const i18n = window.hiveI18n;
                return i18n && typeof i18n.t === "function" ? i18n.t(key) : key;
            };
            this.usersURL = "http://localhost:8080/api/v1/users/get-all";
            this.createURLs = [
                "http://localhost:8080/api/v1/users/create"
            ];
            this.resetForm = () => {
                this.user.firstName("");
                this.user.lastName("");
                this.user.email("");
                this.user.password("");
            };
            this.getUsers = () => __awaiter(this, void 0, void 0, function* () {
                const response = yield fetch(this.usersURL);
                if (!response.ok) {
                    throw new Error("Could not retrieve the user list");
                }
                const data = yield response.json();
                return Array.isArray(data === null || data === void 0 ? void 0 : data.User) ? data.User : [];
            });
            this.createUserInApi = (payload) => __awaiter(this, void 0, void 0, function* () {
                let lastStatus = "";
                for (const endpoint of this.createURLs) {
                    const response = yield fetch(endpoint, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(payload)
                    });
                    if (response.ok) {
                        return;
                    }
                    lastStatus = `HTTP ${response.status} en ${endpoint}`;
                }
                throw new Error(lastStatus || "Could not create the user");
            });
            this.registrar = () => __awaiter(this, void 0, void 0, function* () {
                if (this.isSubmitting()) {
                    return;
                }
                const currentUser = {
                    firstName: this.user.firstName().trim(),
                    lastName: this.user.lastName().trim(),
                    email: this.user.email().trim(),
                    password: this.user.password().trim()
                };
                if (signupValidation.hasEmptyRequiredSignupFields(currentUser)) {
                    showLogAlert("You must complete all fields", "#f44336");
                    return;
                }
                if (!signupValidation.hasOnlyAlphabeticNames(currentUser)) {
                    showLogAlert("First and last names can only contain letters", "#f44336");
                    return;
                }
                if (!loginValidation.isValidLoginEmailFormat(currentUser.email)) {
                    showLogAlert("The email format is not valid", "#f44336");
                    return;
                }
                this.isSubmitting(true);
                try {
                    const usuarios = yield this.getUsers();
                    const alreadyExists = usuarios.some((u) => { var _a; return String((_a = u.email) !== null && _a !== void 0 ? _a : "").trim().toLowerCase() === currentUser.email.toLowerCase(); });
                    if (alreadyExists) {
                        showLogAlert("El usuario ya está registrado", "#f44336");
                        return;
                    }
                    const maxId = usuarios.reduce((acc, item) => {
                        const numericId = Number(item.id);
                        return Number.isFinite(numericId) ? Math.max(acc, numericId) : acc;
                    }, 0);
                    const payload = {
                        User: [
                            {
                                id: maxId + 1,
                                roleId: 3,
                                email: currentUser.email,
                                firstName: currentUser.firstName,
                                lastName: currentUser.lastName,
                                password: currentUser.password
                            }
                        ]
                    };
                    yield this.createUserInApi(payload);
                    this.resetForm();
                    showLogAlert("Usuario registrado correctamente", "#1D4355");
                    window.setTimeout(() => {
                        window.location.href = "?ojr=login";
                    }, 2000);
                }
                catch (error) {
                    console.error("Error al registrar usuario:", error);
                    showLogAlert("Could not register the user at this time", "#f44336");
                }
                finally {
                    this.isSubmitting(false);
                }
            });
        }
    }
    return SignupViewModel;
});
//# sourceMappingURL=signup.js.map