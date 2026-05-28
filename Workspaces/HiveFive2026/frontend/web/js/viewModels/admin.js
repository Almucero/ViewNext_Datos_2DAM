var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "knockout", "ojs/ojmodel", "ojs/ojcollectiondataprovider", "ojs/ojbutton", "ojs/ojdialog", "ojs/ojformlayout", "ojs/ojinputtext", "ojs/ojknockout", "ojs/ojlabel", "ojs/ojlistview", "ojs/ojselectcombobox", "ojs/ojselectsingle"], function (require, exports, ko, ojmodel_1, CollectionDataProvider) {
    "use strict";
    function showLogAlert(message, backgroundColor) {
        const alertDiv = document.createElement("div");
        alertDiv.className = "custom-log-alert";
        alertDiv.textContent = message;
        alertDiv.style.backgroundColor = backgroundColor;
        document.body.appendChild(alertDiv);
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 2000);
    }
    class AdminViewModel {
        constructor() {
            this.t = (key) => {
                const i18n = window.hiveI18n;
                return i18n && typeof i18n.t === "function" ? i18n.t(key) : key;
            };
            this.userSelected = ko.observable(false);
            this.selectedUser = ko.observable(null);
            this.firstSelectedUser = ko.observable();
            this.usersApiBase = "http://localhost:8080/api/v1/users";
            this.userCol = ko.observable();
            this.userDatasourse = ko.observable();
            this.inicializar = () => {
                this.user({
                    userId: 0,
                    email: "",
                    firstName: "",
                    lastName: "",
                    password: "",
                    role: {
                        id: 0,
                        name: "",
                    },
                    boards: {
                        board: [
                            {
                                id: 0,
                                name: "",
                            },
                        ],
                    },
                });
            };
            this.createCollectionUser = () => {
                const parseSaveUser = (response) => {
                    return Object.assign({}, response);
                };
                const parseUser = (response) => {
                    var _a, _b, _c, _d, _e;
                    return Object.assign(Object.assign({}, response), { userId: Number((_b = (_a = response.userId) !== null && _a !== void 0 ? _a : response.id) !== null && _b !== void 0 ? _b : 0), role: (_c = response.role) !== null && _c !== void 0 ? _c : {
                            id: Number((_d = response.roleId) !== null && _d !== void 0 ? _d : 0),
                            name: "",
                        }, boards: (_e = response.boards) !== null && _e !== void 0 ? _e : { board: [] } });
                };
                const restServerURLUsers = "http://localhost:8080/api/v1/users/get-all";
                let UserCollection = ojmodel_1.Collection.extend({
                    url: restServerURLUsers,
                    model: ojmodel_1.Model.extend({
                        urlRoot: restServerURLUsers,
                        parse: parseUser,
                        parseSave: parseSaveUser,
                        idAttribute: "id",
                    }),
                    comparator: "id",
                });
                return new UserCollection();
            };
            this.getUser = () => {
                var _a, _b, _c, _d, _e;
                let model = this.userCol().get(this.userID);
                if (!model) {
                    return;
                }
                let boardsData = model.get("boards");
                let boards = boardsData
                    ? boardsData.board.map((board) => ({
                        id: board.id,
                        name: board.name,
                    }))
                    : [];
                const userAux = {
                    userId: model.get("id"),
                    email: model.get("email"),
                    firstName: model.get("firstName"),
                    lastName: model.get("lastName"),
                    password: model.get("password"),
                    role: {
                        id: Number((_c = (_a = model.get("roleId")) !== null && _a !== void 0 ? _a : (_b = model.get("role")) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : 0),
                        name: (_e = (_d = model.get("role")) === null || _d === void 0 ? void 0 : _d.name) !== null && _e !== void 0 ? _e : "",
                    },
                    boards: {
                        board: boards,
                    },
                };
                this.userLogin(userAux);
            };
            this.resolveRoleId = () => {
                const role = this.user().role;
                if (typeof role === "number")
                    return role;
                if (role && typeof role.id !== "undefined")
                    return Number(role.id) || 3;
                return 3;
            };
            this.normalizePassword = (password) => {
                const value = String(password !== null && password !== void 0 ? password : "");
                if (value.startsWith("{noop}")) {
                    return value.replace("{noop}", "");
                }
                return value;
            };
            this.refreshUsers = () => __awaiter(this, void 0, void 0, function* () {
                yield this.userCol().fetch();
                this.userDatasourse(new CollectionDataProvider(this.userCol()));
            });
            this.openCreateUserDialog = () => {
                if (this.user().email != "")
                    this.inicializar();
                document.getElementById("createUserDialog").open();
            };
            this.openAsignDialog = () => {
                document.getElementById("AsignBoardDialog").open();
            };
            this.closeAsignDialog = () => {
                document.getElementById("AsignBoardDialog").close();
            };
            this.closeCreateUserDialog = () => {
                document.getElementById("createUserDialog").close();
            };
            this.openUpdateUserDialog = () => {
                document.getElementById("editDialog").open();
            };
            this.closeUpdateUserDialog = () => {
                document.getElementById("editDialog").close();
            };
            this.closeEmailDialog = () => {
                document.getElementById("emailDialog").close();
            };
            this.openDeleteUserDialog = () => {
                document.getElementById("deleteUserDialog").open();
            };
            this.closeDeleteUserDialog = () => {
                document.getElementById("deleteUserDialog").close();
            };
            this.addUser = () => {
                const users = this.userCol().toJSON() || [];
                const maxId = users.reduce((acc, item) => {
                    var _a;
                    const id = Number((_a = item.id) !== null && _a !== void 0 ? _a : 0);
                    return Number.isFinite(id) ? Math.max(acc, id) : acc;
                }, 0);
                const payload = {
                    User: [
                        {
                            id: maxId + 1,
                            roleId: this.resolveRoleId(),
                            email: this.user().email,
                            firstName: this.user().firstName,
                            lastName: this.user().lastName,
                            password: this.normalizePassword(this.user().password),
                        },
                    ],
                };
                fetch(`${this.usersApiBase}/create`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                })
                    .then((response) => __awaiter(this, void 0, void 0, function* () {
                    if (!response.ok)
                        throw new Error(`HTTP ${response.status}`);
                    yield this.refreshUsers();
                    showLogAlert("User created successfully", "#1D4355");
                    this.closeCreateUserDialog();
                }))
                    .catch(() => {
                    showLogAlert("Error creating the user. Please try again.", "#f44336");
                });
            };
            this.selectUser = (event) => __awaiter(this, void 0, void 0, function* () {
                let itemContext = event.detail.value;
                if (itemContext != null) {
                    const keys = itemContext.keys
                        .keys;
                    const selectedUser = yield this.userDatasourse().fetchByKeys({ keys });
                    this.user(Object.assign({ userId: selectedUser.results.get(Array.from(keys.values())[0]).data.id }, selectedUser.results.get(Array.from(keys.values())[0]).data));
                    this.emailAux = this.user().email;
                    this.userSelected(true);
                }
                else {
                    this.userSelected(false);
                }
            });
            this.updateUser = () => __awaiter(this, void 0, void 0, function* () {
                let abierto = false;
                const payload = {
                    User: [
                        {
                            id: this.user().userId,
                            roleId: this.resolveRoleId(),
                            email: this.user().email,
                            firstName: this.user().firstName,
                            lastName: this.user().lastName,
                            password: this.normalizePassword(this.user().password),
                        },
                    ],
                };
                if (this.emailAux != this.user().email) {
                    document.getElementById("emailDialog").open();
                    abierto = true;
                }
                if (abierto == false) {
                    fetch(`${this.usersApiBase}/update`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    })
                        .then((response) => __awaiter(this, void 0, void 0, function* () {
                        if (!response.ok)
                            throw new Error(`HTTP ${response.status}`);
                        yield this.refreshUsers();
                        showLogAlert("User updated successfully", "#1D4355");
                        document.getElementById("editDialog").close();
                    }))
                        .catch(() => {
                        showLogAlert("Error: missing data. Please fill in all fields.", "#f44336");
                    });
                }
            });
            this.updateEmailUser = () => __awaiter(this, void 0, void 0, function* () {
                const payload = {
                    User: [
                        {
                            id: this.user().userId,
                            roleId: this.resolveRoleId(),
                            email: this.user().email,
                            firstName: this.user().firstName,
                            lastName: this.user().lastName,
                            password: this.normalizePassword(this.user().password),
                        },
                    ],
                };
                fetch(`${this.usersApiBase}/update`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                })
                    .then((response) => __awaiter(this, void 0, void 0, function* () {
                    if (!response.ok)
                        throw new Error(`HTTP ${response.status}`);
                    yield this.refreshUsers();
                    showLogAlert("User updated successfully", "#1D4355");
                    document.getElementById("editDialog").close();
                    document.getElementById("emailDialog").close();
                }))
                    .catch(() => {
                    showLogAlert("Error: missing data. Please fill in all fields.", "#f44336");
                });
            });
            this.asignar = () => __awaiter(this, void 0, void 0, function* () {
                const payload = {
                    User: [
                        {
                            id: this.user().userId,
                            roleId: this.resolveRoleId(),
                            email: this.user().email,
                            firstName: this.user().firstName,
                            lastName: this.user().lastName,
                            password: this.normalizePassword(this.user().password),
                        },
                    ],
                };
                fetch(`${this.usersApiBase}/update`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                })
                    .then((response) => __awaiter(this, void 0, void 0, function* () {
                    if (!response.ok)
                        throw new Error(`HTTP ${response.status}`);
                    yield this.refreshUsers();
                    showLogAlert("Board assigned successfully", "#1D4355");
                    document.getElementById("AsignBoardDialog").close();
                }))
                    .catch(() => {
                    showLogAlert("Error: faltan datos. Por favor, rellene todos los campos.", "#f44336");
                });
            });
            this.deleteUser = () => {
                fetch(`${this.usersApiBase}/delete/${this.user().userId}`, {
                    method: "DELETE",
                })
                    .then((response) => __awaiter(this, void 0, void 0, function* () {
                    if (!response.ok)
                        throw new Error(`HTTP ${response.status}`);
                    yield this.refreshUsers();
                    showLogAlert("User deleted successfully", "#1D4355");
                    this.userSelected(false);
                    this.closeDeleteUserDialog();
                }))
                    .catch(() => {
                    showLogAlert("Error deleting user", "#f44336");
                });
            };
            this.getBoards = (boardList) => {
                let res = "";
                boardList.forEach((board) => {
                    res += board.name + ", ";
                });
                res = res.substring(0, res.length - 2);
                return res;
            };
            this.emailAux = "";
            const ssUser = sessionStorage.getItem("user");
            const jsonObject = JSON.parse(ssUser);
            this.userID = jsonObject.userId;
            this.userLogin = ko.observable({
                userId: jsonObject.userId,
                email: jsonObject.email,
                firstName: jsonObject.firstName,
                lastName: jsonObject.lastName,
                password: jsonObject.password,
                role: {
                    id: jsonObject.roleId,
                    name: jsonObject.roleName,
                },
                boards: {
                    board: [
                        {
                            id: 0,
                            name: "",
                        },
                    ],
                },
            });
            this.user = ko.observable({
                userId: 0,
                email: "",
                firstName: "",
                lastName: "",
                password: "",
                role: {
                    id: 0,
                    name: "",
                },
                boards: {
                    board: [
                        {
                            id: 0,
                            name: "",
                        },
                    ],
                },
            });
            this.userCol(this.createCollectionUser());
            this.userCol()
                .fetch()
                .then(() => {
                this.getUser();
            })
                .catch((error) => {
                console.error("Error al cargar la colección:", error);
            });
            this.userDatasourse(new CollectionDataProvider(this.userCol()));
        }
    }
    return AdminViewModel;
});
//# sourceMappingURL=admin.js.map