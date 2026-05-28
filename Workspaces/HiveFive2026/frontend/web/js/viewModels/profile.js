define(["require", "exports", "knockout", "ojs/ojmodel", "./profile.validation", "ojs/ojbutton", "ojs/ojformlayout", "ojs/ojinputtext", "ojs/ojknockout", "ojs/ojlabel"], function (require, exports, ko, ojmodel_1, profile_validation_1) {
    "use strict";
    function showLogAlert(message, backgroundColor) {
        const alertDiv = document.createElement("div");
        alertDiv.className = "custom-log-alert";
        alertDiv.textContent = message;
        alertDiv.style.backgroundColor = backgroundColor;
        document.body.appendChild(alertDiv);
        setTimeout(() => {
            if (alertDiv.parentNode)
                alertDiv.parentNode.removeChild(alertDiv);
        }, 2000);
    }
    class ProfileViewModel {
        constructor() {
            var _a;
            this.UserCol = ko.observable();
            this.updated = ko.observable(false);
            this.t = (key) => {
                const i18n = window.hiveI18n;
                return i18n && typeof i18n.t === "function" ? i18n.t(key) : key;
            };
            this.createCollectionUser = () => {
                const restURL = "http://localhost:8080/api/v1/users/get-all";
                const UserModel = ojmodel_1.Model.extend({
                    idAttribute: "id"
                });
                const UserCollection = ojmodel_1.Collection.extend({
                    url: restURL,
                    model: UserModel,
                    parse: function (response) {
                        var _a;
                        return (_a = response.User) !== null && _a !== void 0 ? _a : [];
                    },
                    comparator: "id"
                });
                return new UserCollection();
            };
            this.getUser = () => {
                const collection = this.UserCol();
                const model = collection.get(this.userID);
                if (!model) {
                    console.error("No user found with ID:", this.userID);
                    return;
                }
                const userAux = {
                    userId: model.get("id"),
                    email: model.get("email"),
                    firstName: model.get("firstName"),
                    lastName: model.get("lastName"),
                    password: model.get("password"),
                    role: {
                        id: model.get("roleId"),
                        name: "Unspecified"
                    },
                    boards: { board: [] }
                };
                this.user(userAux);
                this.originalProfile = {
                    firstName: userAux.firstName,
                    lastName: userAux.lastName,
                    email: userAux.email,
                };
            };
            this.update = () => {
                this.updated(true);
            };
            this.submit = () => {
                const currentProfile = {
                    firstName: this.user().firstName,
                    lastName: this.user().lastName,
                    email: this.user().email,
                };
                if ((0, profile_validation_1.hasEmptyRequiredProfileFields)(currentProfile)) {
                    showLogAlert("All fields are required", "#f44336");
                    return;
                }
                if (!(0, profile_validation_1.hasOnlyAlphabeticNames)(currentProfile)) {
                    showLogAlert("First and last names can only contain letters (A-Z, a-z, and accents)", "#f44336");
                    return;
                }
                if (!(0, profile_validation_1.isValidEmailFormat)(currentProfile.email)) {
                    showLogAlert("The email format is not valid", "#f44336");
                    return;
                }
                if (!(0, profile_validation_1.hasProfileChanges)(this.originalProfile, currentProfile)) {
                    showLogAlert("You must change at least one field", "#f44336");
                    return;
                }
                const updateURL = "http://localhost:8080/api/v1/users/update";
                const payload = {
                    User: [
                        {
                            id: this.user().userId,
                            email: this.user().email,
                            firstName: this.user().firstName,
                            lastName: this.user().lastName,
                        }
                    ]
                };
                fetch(updateURL, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload)
                })
                    .then((response) => {
                    if (!response.ok)
                        throw new Error("Error del servidor");
                    showLogAlert("User updated successfully", "#1D4355");
                    const updatedUser = payload.User[0];
                    sessionStorage.setItem("user", JSON.stringify({
                        id: updatedUser.id,
                        userId: updatedUser.id,
                        firstName: updatedUser.firstName,
                        lastName: updatedUser.lastName,
                        email: updatedUser.email,
                        roleId: this.user().role.id,
                        roleName: this.user().role.name,
                        boards: this.user().boards
                    }));
                    this.originalProfile = {
                        firstName: updatedUser.firstName,
                        lastName: updatedUser.lastName,
                        email: updatedUser.email,
                    };
                    this.updated(false);
                    setTimeout(() => {
                        window.location.href = window.location.pathname.split('/').slice(0, -1).join('/') + "/?ojr=boardsList";
                    }, 250);
                })
                    .catch((err) => {
                    console.error("Error updating user:", err);
                    showLogAlert("Error updating user", "#f44336");
                });
            };
            this.logout = () => {
                sessionStorage.clear();
                window.location.href = "http://localhost:8000";
            };
            const ssUser = sessionStorage.getItem("user");
            const jsonObject = JSON.parse(ssUser);
            this.userID = Number((_a = jsonObject.id) !== null && _a !== void 0 ? _a : jsonObject.userId);
            this.user = ko.observable({
                userId: this.userID,
                email: jsonObject.email,
                firstName: jsonObject.firstName,
                lastName: jsonObject.lastName,
                password: jsonObject.password,
                role: {
                    id: jsonObject.roleId,
                    name: jsonObject.roleName
                },
                boards: jsonObject.boards
            });
            this.originalProfile = {
                firstName: jsonObject.firstName || "",
                lastName: jsonObject.lastName || "",
                email: jsonObject.email || "",
            };
            this.UserCol(this.createCollectionUser());
            this.UserCol()
                .fetch()
                .then(() => this.getUser())
                .catch((err) => console.error("Error loading users:", err));
        }
    }
    return ProfileViewModel;
});
//# sourceMappingURL=profile.js.map