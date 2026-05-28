var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "knockout", "ojs/ojresponsiveknockoututils", "ojs/ojresponsiveutils", "ojs/ojcorerouter", "ojs/ojmodulerouter-adapter", "ojs/ojknockoutrouteradapter", "ojs/ojurlparamadapter", "ojs/ojarraydataprovider", "ojs/ojdrawerpopup", "ojs/ojknockout", "ojs/ojmodule-element"], function (require, exports, ko, ResponsiveKnockoutUtils, ResponsiveUtils, ojcorerouter_1, ojmodulerouter_adapter_1, ojknockoutrouteradapter_1, ojurlparamadapter_1, ojarraydataprovider_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ko = __importStar(ko);
    ResponsiveKnockoutUtils = __importStar(ResponsiveKnockoutUtils);
    ResponsiveUtils = __importStar(ResponsiveUtils);
    ojcorerouter_1 = __importDefault(ojcorerouter_1);
    ojmodulerouter_adapter_1 = __importDefault(ojmodulerouter_adapter_1);
    ojknockoutrouteradapter_1 = __importDefault(ojknockoutrouteradapter_1);
    ojurlparamadapter_1 = __importDefault(ojurlparamadapter_1);
    ojarraydataprovider_1 = __importDefault(ojarraydataprovider_1);
    const TRANSLATIONS = {
        es: {
            "nav.boards": "Tableros",
            "nav.profile": "Perfil",
            "nav.users": "Usuarios",
            "menu.label": "Menu",
            "menu.profile": "Mi perfil",
            "menu.signOut": "Cerrar sesion",
            "app.menu": "Menu",
            "app.myProfile": "Mi perfil",
            "app.signOut": "Cerrar sesion",
            "app.goHomeTitle": "Ir a Inicio",
            "app.brandSubtitle": "VIEWNEXT DIGITAL WORKPLACE",
            "app.footerCopyright": "Copyright © 2024 Hive-5 y/o sus afiliados. Todos los derechos reservados.",
            "header.subtitle": "VIEWNEXT DIGITAL WORKPLACE",
            "selector.language": "Idioma",
            "footer.copyright": "Copyright © 2024 Hive-5 y/o sus afiliados. Todos los derechos reservados.",
            "auth.login.title": "Iniciar sesion",
            "auth.login.subtitle": "Accede a tu espacio digital",
            "auth.email": "Correo",
            "auth.password": "Contrasena",
            "auth.signIn": "Entrar",
            "auth.noAccount": "No tienes cuenta?",
            "auth.registerHere": "Registrate aqui",
            "auth.signup.title": "Crear cuenta",
            "auth.signup.subtitle": "Unete a la comunidad Hive-5",
            "auth.firstName": "Nombre",
            "auth.lastName": "Apellidos",
            "auth.register": "Registrarse",
            "auth.haveAccount": "Ya tienes cuenta?",
            "auth.signInLink": "Inicia sesion",
            "boards.welcome": "Bienvenido,",
            "boards.title": "TABLEROS",
            "boards.create": "Crear tablero",
            "boards.edit": "Editar tablero",
            "boards.delete": "Eliminar tablero",
            "boards.dialogCreateTitle": "Crear nuevo tablero",
            "boards.dialogEditTitle": "Editar tablero",
            "boards.boardName": "Nombre del tablero",
            "boards.exportTitle": "Exportar tablero a otro tablero",
            "boards.from": "Desde",
            "boards.to": "Hacia",
            "boards.move": "Mover",
            "common.create": "Crear",
            "common.update": "Actualizar",
            "cards.welcome": "Bienvenido,",
            "cards.create": "Crear",
            "cards.updateDelete": "Actualizar / Eliminar",
            "cards.todo": "POR HACER",
            "cards.doing": "EN CURSO",
            "cards.blocked": "BLOQUEADO",
            "cards.done": "HECHO",
            "cards.dialogCreateTitle": "Crear nueva tarjeta",
            "cards.dialogEditTitle": "Editar tarjeta",
            "cards.cardName": "Nombre de tarjeta",
            "cards.cardDescription": "Descripcion",
            "cards.startDate": "Fecha inicio",
            "cards.endDate": "Fecha fin",
            "cards.priority": "Prioridad",
            "cards.status": "Estado",
            "cards.statusTodo": "Por hacer",
            "cards.statusDoing": "En curso",
            "cards.statusBlocked": "Bloqueado",
            "cards.statusDone": "Hecho",
            "cards.alertRequired": "Todos los campos de la tarjeta son obligatorios",
            "cards.alertPriority": "Prioridad invalida, elige un numero entre 1 y 9",
            "cards.alertDates": "La fecha fin debe ser igual o posterior a la fecha inicio",
            "cards.alertResolveUser": "No se pudo resolver el usuario para crear la tarjeta",
            "cards.alertCreated": "Tarjeta creada correctamente",
            "cards.alertCreateError": "Error: faltan datos o no se pudo conectar con el servicio.",
            "cards.alertSelectDelete": "Selecciona una tarjeta antes de eliminarla",
            "cards.alertDeleted": "Tarjeta eliminada correctamente",
            "cards.alertDeleteError": "Error: no se pudo eliminar la tarjeta.",
            "cards.alertSelectUpdate": "Selecciona una tarjeta antes de actualizarla",
            "cards.alertNoChanges": "Debes modificar al menos un campo",
            "cards.alertUpdated": "Tarjeta actualizada correctamente",
            "cards.alertUpdateError": "Error: no se pudo actualizar la tarjeta o faltan datos.",
            "common.delete": "Eliminar",
            "profile.title": "MI PERFIL",
            "profile.update": "Actualizar",
            "admin.title": "Usuarios",
            "admin.createUser": "Crear usuario",
            "admin.updateUser": "Actualizar usuario",
            "admin.deleteUser": "Eliminar usuario",
            "admin.assignBoard": "Asignar tablero",
            "admin.firstName": "Nombre:",
            "admin.lastName": "Apellidos:",
            "admin.email": "Correo:",
            "admin.role": "Rol:",
            "admin.boards": "Tableros:",
            "admin.dialogCreateUser": "Crear usuario",
            "admin.dialogUpdateUser": "Actualizar usuario",
            "admin.dialogDeleteUser": "Eliminar usuario",
            "admin.dialogAssignBoards": "Asignar tableros al usuario",
            "admin.roleInput": "Rol",
            "admin.boardsInput": "Tableros",
            "admin.add": "Agregar",
            "admin.cancel": "Cancelar",
            "admin.saveChanges": "Guardar cambios",
            "admin.deleteConfirm": "Estas seguro de que quieres eliminar al usuario",
            "admin.assign": "Asignar",
            "admin.dialogChangeEmail": "Cambiar correo",
            "admin.changeEmailConfirm": "Estas seguro de que quieres cambiar el correo?",
            "admin.accept": "Aceptar"
        },
        en: {
            "nav.boards": "Boards",
            "nav.profile": "Profile",
            "nav.users": "Users",
            "menu.label": "Menu",
            "menu.profile": "My profile",
            "menu.signOut": "Sign out",
            "app.menu": "Menu",
            "app.myProfile": "My profile",
            "app.signOut": "Sign out",
            "app.goHomeTitle": "Go to Home",
            "app.brandSubtitle": "VIEWNEXT DIGITAL WORKPLACE",
            "app.footerCopyright": "Copyright © 2024 Hive-5 and/or its affiliates. All rights reserved.",
            "header.subtitle": "VIEWNEXT DIGITAL WORKPLACE",
            "selector.language": "Language",
            "footer.copyright": "Copyright © 2024 Hive-5 and/or its affiliates. All rights reserved.",
            "auth.login.title": "Sign In",
            "auth.login.subtitle": "Access your digital workspace",
            "auth.email": "Email",
            "auth.password": "Password",
            "auth.signIn": "Sign In",
            "auth.noAccount": "Don't have an account?",
            "auth.registerHere": "Register here",
            "auth.signup.title": "Create Account",
            "auth.signup.subtitle": "Join the Hive-5 community",
            "auth.firstName": "First Name",
            "auth.lastName": "Last Name",
            "auth.register": "Register",
            "auth.haveAccount": "Already have an account?",
            "auth.signInLink": "Sign in",
            "boards.welcome": "Welcome,",
            "boards.title": "BOARDS",
            "boards.create": "Create Board",
            "boards.edit": "Edit Board",
            "boards.delete": "Delete Board",
            "boards.dialogCreateTitle": "Create New Board",
            "boards.dialogEditTitle": "Edit Board",
            "boards.boardName": "Board Name",
            "boards.exportTitle": "Export Board to another board",
            "boards.from": "From",
            "boards.to": "To",
            "boards.move": "Move",
            "common.create": "Create",
            "common.update": "Update",
            "cards.welcome": "Welcome,",
            "cards.create": "Create",
            "cards.updateDelete": "Update / Delete",
            "cards.todo": "TO DO",
            "cards.doing": "DOING",
            "cards.blocked": "BLOCKED",
            "cards.done": "DONE",
            "cards.dialogCreateTitle": "Create New Card",
            "cards.dialogEditTitle": "Edit Card",
            "cards.cardName": "Card Name",
            "cards.cardDescription": "Card Description",
            "cards.startDate": "Start Date",
            "cards.endDate": "End Date",
            "cards.priority": "Card Priority",
            "cards.status": "Status",
            "cards.statusTodo": "To do",
            "cards.statusDoing": "Doing",
            "cards.statusBlocked": "Blocked",
            "cards.statusDone": "Done",
            "cards.alertRequired": "All card fields are required",
            "cards.alertPriority": "Invalid priority, choose a number between 1 and 9",
            "cards.alertDates": "The end date must be the same as or later than the start date",
            "cards.alertResolveUser": "Could not resolve the user to create the card",
            "cards.alertCreated": "Card created successfully",
            "cards.alertCreateError": "Error: required data is missing or the service is unavailable.",
            "cards.alertSelectDelete": "Select a card before deleting it",
            "cards.alertDeleted": "Card deleted successfully",
            "cards.alertDeleteError": "Error: the card could not be deleted.",
            "cards.alertSelectUpdate": "Select a card before updating it",
            "cards.alertNoChanges": "You must change at least one field",
            "cards.alertUpdated": "Card updated successfully",
            "cards.alertUpdateError": "Error: the card could not be updated or required data is missing.",
            "common.delete": "Delete",
            "profile.title": "MY PROFILE",
            "profile.update": "Update",
            "admin.title": "Users",
            "admin.createUser": "Create User",
            "admin.updateUser": "Update User",
            "admin.deleteUser": "Delete User",
            "admin.assignBoard": "Assign Board",
            "admin.firstName": "First Name:",
            "admin.lastName": "Last Name:",
            "admin.email": "Email:",
            "admin.role": "Role:",
            "admin.boards": "Boards:",
            "admin.dialogCreateUser": "Create User",
            "admin.dialogUpdateUser": "Update User",
            "admin.dialogDeleteUser": "Delete User",
            "admin.dialogAssignBoards": "Assign Boards to User",
            "admin.roleInput": "Role",
            "admin.boardsInput": "Boards",
            "admin.add": "Add",
            "admin.cancel": "Cancel",
            "admin.saveChanges": "Save Changes",
            "admin.deleteConfirm": "Are you sure you want to delete the user",
            "admin.assign": "Assign",
            "admin.dialogChangeEmail": "Change Email",
            "admin.changeEmailConfirm": "Are you sure you want to change the email?",
            "admin.accept": "Accept"
        }
    };
    class RootViewModel {
        constructor() {
            var _a, _b;
            this.announcementHandler = (event) => {
                this.message(event.detail.message);
                this.manner(event.detail.manner);
            };
            this.toggleDrawer = () => {
                this.sideDrawerOn(!this.sideDrawerOn());
            };
            this.openedChangedHandler = (event) => {
                if (!event.detail.value) {
                    const drawerToggleButtonElement = document.querySelector("#drawerToggleButton");
                    drawerToggleButtonElement.focus();
                }
            };
            this.onLogoClick = (_data, event) => {
                if (event) {
                    event.preventDefault();
                }
                const hasSession = !!sessionStorage.getItem("user");
                const targetRoute = hasSession ? "boardsList" : "login";
                if (this.router) {
                    this.router.go({ path: targetRoute });
                }
                else {
                    window.location.href = window.location.pathname.split('/').slice(0, -1).join('/') + "/?ojr=" + targetRoute;
                }
                return false;
            };
            this.goToProfile = () => {
                if (this.router && this.currentUser()) {
                    this.router.go({ path: "profile" });
                }
            };
            this.logout = () => {
                sessionStorage.removeItem("user");
                this.currentUser(null);
                this.showHeaderNav(false);
                window.location.href = window.location.pathname.split('/').slice(0, -1).join('/') + "/?ojr=login";
            };
            this.t = (key) => {
                const aliasMap = {
                    "login.title": "auth.login.title",
                    "login.subtitle": "auth.login.subtitle",
                    "login.email": "auth.email",
                    "login.password": "auth.password",
                    "login.signIn": "auth.signIn",
                    "login.noAccount": "auth.noAccount",
                    "login.registerHere": "auth.registerHere",
                    "signup.title": "auth.signup.title",
                    "signup.subtitle": "auth.signup.subtitle",
                    "signup.firstName": "auth.firstName",
                    "signup.lastName": "auth.lastName",
                    "signup.email": "auth.email",
                    "signup.password": "auth.password",
                    "signup.register": "auth.register",
                    "signup.haveAccount": "auth.haveAccount",
                    "signup.signIn": "auth.signInLink",
                    "boardsList.welcome": "boards.welcome",
                    "boardsList.boards": "boards.title",
                    "boardsList.createBoard": "boards.create",
                    "boardsList.editBoard": "boards.edit",
                    "boardsList.deleteBoard": "boards.delete",
                    "boardsList.createNewBoard": "boards.dialogCreateTitle",
                    "boardsList.boardName": "boards.boardName",
                    "boardsList.create": "common.create",
                    "boardsList.editBoardTitle": "boards.dialogEditTitle",
                    "boardsList.update": "common.update",
                    "boardsList.moveBoardTitle": "boards.exportTitle",
                    "boardsList.from": "boards.from",
                    "boardsList.to": "boards.to",
                    "boardsList.move": "boards.move",
                    "profile.firstName": "auth.firstName",
                    "profile.lastName": "auth.lastName",
                    "profile.email": "auth.email",
                };
                const normalizedKey = aliasMap[key] || key;
                const lang = this.currentLanguage();
                return TRANSLATIONS[lang][normalizedKey] || TRANSLATIONS.en[normalizedKey] || key;
            };
            this.updateNavLabels = () => {
                this.navItems.forEach((item) => {
                    if (item.path === "boardsList") {
                        item.detail.label = this.t("nav.boards");
                    }
                    else if (item.path === "profile") {
                        item.detail.label = this.t("nav.profile");
                    }
                    else if (item.path === "admin") {
                        item.detail.label = this.t("nav.users");
                    }
                });
                this.navDataProvider(new ojarraydataprovider_1.default(this.navItems, {
                    keyAttributes: "path",
                }));
            };
            this.setupTranslationObserver = () => {
                const container = document.getElementById("pageContent");
                if (!container) {
                    return;
                }
                this.translationContainer = container;
                this.translationObserver = new MutationObserver(() => {
                    if (this.isApplyingTranslations) {
                        return;
                    }
                    this.applyTranslations(container);
                });
                this.translationObserver.observe(container, {
                    childList: true,
                    subtree: true,
                });
            };
            this.applyTranslations = (root) => {
                if (this.isApplyingTranslations) {
                    return;
                }
                this.isApplyingTranslations = true;
                if (this.translationObserver && this.translationContainer) {
                    this.translationObserver.disconnect();
                }
                try {
                    document.documentElement.lang = this.currentLanguage() === "es" ? "es" : "en-us";
                    const textElements = root.querySelectorAll("[data-i18n]");
                    textElements.forEach((node) => {
                        const key = node.getAttribute("data-i18n") || "";
                        const translated = this.t(key);
                        if (node.textContent !== translated) {
                            node.textContent = translated;
                        }
                    });
                    const titleElements = root.querySelectorAll("[data-i18n-title]");
                    titleElements.forEach((node) => {
                        const key = node.getAttribute("data-i18n-title") || "";
                        const translated = this.t(key);
                        if (node.getAttribute("title") !== translated) {
                            node.setAttribute("title", translated);
                        }
                    });
                    const dialogTitleElements = root.querySelectorAll("[data-i18n-oj-dialog-title]");
                    dialogTitleElements.forEach((node) => {
                        const key = node.getAttribute("data-i18n-oj-dialog-title") || "";
                        const value = this.t(key);
                        if (node.getAttribute("dialog-title") !== value) {
                            node.setAttribute("dialog-title", value);
                        }
                        node.dialogTitle = value;
                    });
                    const labelHintElements = root.querySelectorAll("[data-i18n-oj-label-hint]");
                    labelHintElements.forEach((node) => {
                        const key = node.getAttribute("data-i18n-oj-label-hint") || "";
                        const value = this.t(key);
                        if (node.getAttribute("label-hint") !== value) {
                            node.setAttribute("label-hint", value);
                        }
                        node.labelHint = value;
                    });
                }
                finally {
                    this.isApplyingTranslations = false;
                    if (this.translationObserver && this.translationContainer) {
                        this.translationObserver.observe(this.translationContainer, {
                            childList: true,
                            subtree: true,
                        });
                    }
                }
            };
            this.toggleLanguage = () => {
                this.currentLanguage(this.currentLanguage() === "en" ? "es" : "en");
            };
            this.manner = ko.observable("polite");
            this.message = ko.observable();
            const savedLanguage = (localStorage.getItem("hive5-language") || localStorage.getItem("hivefive.lang") || "").toLowerCase();
            const initialLanguage = savedLanguage === "es" ? "es" : "en";
            this.currentLanguage = ko.observable(initialLanguage);
            this.languageLabel = ko.pureComputed(() => (this.currentLanguage() === "en" ? "EN" : "ES"));
            this.translationObserver = null;
            this.translationContainer = null;
            this.isApplyingTranslations = false;
            window.hiveI18n = { t: (key) => this.t(key) };
            const globalBodyElement = document.getElementById("globalBody");
            globalBodyElement.addEventListener("announce", this.announcementHandler, false);
            const smQuery = ResponsiveUtils.getFrameworkQuery("sm-only");
            if (smQuery)
                this.smScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);
            const mdQuery = ResponsiveUtils.getFrameworkQuery("md-up");
            if (mdQuery)
                this.mdScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(mdQuery);
            const userString = sessionStorage.getItem("user");
            const user = userString ? JSON.parse(userString) : null;
            this.currentUser = ko.observable(user);
            const navData = [
                { path: "", redirect: user ? "boardsList" : "login" },
                { path: "login", detail: { label: "", iconClass: "" } },
                { path: "signup", detail: { label: "", iconClass: "" } },
                { path: "boards", detail: { label: "", iconClass: "" } },
                { path: "boardsList", detail: { label: this.t("nav.boards"), iconClass: "" } },
                { path: "profile", detail: { label: this.t("nav.profile"), iconClass: "" } },
            ];
            if (((_a = user === null || user === void 0 ? void 0 : user.role) === null || _a === void 0 ? void 0 : _a.id) === 1) {
                navData.push({
                    path: "admin",
                    detail: { label: this.t("nav.users"), iconClass: "" }
                });
            }
            const router = new ojcorerouter_1.default(navData, {
                urlAdapter: new ojurlparamadapter_1.default(),
            });
            this.router = router;
            router.sync();
            this.moduleAdapter = new ojmodulerouter_adapter_1.default(router, {
                viewPath: "views/",
                viewModelPath: "viewModels/",
            });
            this.selection = new ojknockoutrouteradapter_1.default(router);
            const navItems = user
                ? navData.slice(1).filter((item) => { var _a; return (_a = item.detail) === null || _a === void 0 ? void 0 : _a.label; })
                : [];
            this.navItems = navItems;
            this.showHeaderNav = ko.observable(!!user && navItems.length > 0);
            this.navDataProvider = ko.observable(new ojarraydataprovider_1.default(navItems, {
                keyAttributes: "path",
            }));
            this.sideDrawerOn = ko.observable(false);
            (_b = this.mdScreen) === null || _b === void 0 ? void 0 : _b.subscribe(() => {
                this.sideDrawerOn(false);
            });
            this.appName = ko.observable("Hive-5");
            this.userLogin = ko.observable("");
            this.currentLanguage.subscribe(() => {
                localStorage.setItem("hive5-language", this.currentLanguage());
                this.updateNavLabels();
                this.applyTranslations(document);
            });
            this.setupTranslationObserver();
            this.applyTranslations(document);
            window.oj.Context.getPageContext().getBusyContext().applicationBootstrapComplete();
        }
    }
    exports.default = new RootViewModel();
});
//# sourceMappingURL=appController.js.map