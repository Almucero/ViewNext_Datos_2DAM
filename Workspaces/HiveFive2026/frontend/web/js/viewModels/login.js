"use strict";
define(["require", "exports", "knockout", "viewModels/login.validation"], function (require, exports, ko, loginValidation) {
    class LoginViewModel {
        constructor() {
            this.user = {
                email: ko.observable(""),
                password: ko.observable("")
            };
            this.mensaje = ko.observable("");
            this.t = (key) => {
                const i18n = window.hiveI18n;
                return i18n && typeof i18n.t === "function" ? i18n.t(key) : key;
            };
            this.goToSignup = (_data, event) => {
                event === null || event === void 0 ? void 0 : event.preventDefault();
                window.location.href = "?ojr=signup";
                return false;
            };
            this.acceder = () => {
                const email = this.user.email();
                const password = this.user.password();
                if (!email || !password) {
                    this.mensaje("Debes completar usuario y contraseña");
                    return;
                }
                if (!loginValidation.isValidLoginEmailFormat(email)) {
                    this.mensaje("El email no tiene un formato válido");
                    return;
                }
                const url = "http://localhost:8080/api/v1/users/get-all";
                fetch(url)
                    .then(res => res.json())
                    .then((data) => {
                    const usuarios = data.User;
                    const usuario = usuarios.find((u) => u.email === email && u.password === password);
                    if (!usuario) {
                        this.mensaje("Usuario o contraseña incorrectos");
                        return;
                    }
                    sessionStorage.setItem("user", JSON.stringify({
                        userId: usuario.id,
                        roleId: usuario.roleId,
                        email: usuario.email,
                        firstName: usuario.firstName,
                        lastName: usuario.lastName,
                        password: usuario.password
                    }));
                    window.location.href = "?ojr=boardsList";
                })
                    .catch(err => {
                    console.error(err);
                    this.mensaje("Error connecting to the server");
                });
            };
        }
    }
    return LoginViewModel;
});
//# sourceMappingURL=login.js.map