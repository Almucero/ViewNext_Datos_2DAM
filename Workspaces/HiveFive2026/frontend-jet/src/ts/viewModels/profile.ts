/**
 * Archivo: ts/viewModels/profile.ts
 * Proposito: Define logica de UI, estado observable, validaciones y llamadas async de este modulo.
 * Nota: Los comentarios priorizan flujo, side-effects y decisiones de integracion.
 */
import ko = require("knockout");
import "ojs/ojbutton";
import "ojs/ojformlayout";
import "ojs/ojinputtext";
import "ojs/ojknockout";
import "ojs/ojlabel";
import { Collection, Model } from "ojs/ojmodel";
import {
  hasOnlyAlphabeticNames,
  hasEmptyRequiredProfileFields,
  hasProfileChanges,
  isValidEmailFormat,
  type EditableProfile,
} from "./profile.validation";

type User = {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: Role;
  boards: {
    board: Board[];
  };
};

type Role = { id: number; name: string };
type Board = { id: number; name: string };

function showLogAlert(message: string, backgroundColor: string) {
  const alertDiv = document.createElement("div");
  alertDiv.className = "custom-log-alert";
  alertDiv.textContent = message;
  alertDiv.style.backgroundColor = backgroundColor;
  document.body.appendChild(alertDiv);

  setTimeout(() => {
    if (alertDiv.parentNode) alertDiv.parentNode.removeChild(alertDiv);
  }, 2000);
}

// ViewModel principal: concentra estado observable, eventos de UI y orquestacion de servicios.
class ProfileViewModel {
  private UserCol: ko.Observable = ko.observable();
  user: ko.Observable<User>;
  userID: number;
  updated: ko.Observable = ko.observable(false);
  originalProfile: EditableProfile;

  t = (key: string): string => {
    const i18n = (window as any).hiveI18n;
    return i18n && typeof i18n.t === "function" ? i18n.t(key) : key;
  };
  // Inicializa observables, adapta datos de sesion y dispara cargas iniciales.
  constructor() {
    const ssUser = sessionStorage.getItem("user");
    const jsonObject = JSON.parse(ssUser as string);

    this.userID = Number(jsonObject.id ?? jsonObject.userId);

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
      .catch((err: Error) => console.error("Error OSB:", err));
  }


  // GET USERS (Spring Boot compatibility API)
  createCollectionUser = () => {
    const restURL = "http://localhost:8080/api/v1/users/get-all";
  
    const UserModel = Model.extend({
      idAttribute: "id"
    });
  
    const UserCollection = Collection.extend({
      url: restURL,
      model: UserModel,
      parse: function (response) {
        return response.User ?? [];
      },
  
      comparator: "id"
    });
  
    return new UserCollection();
  };

  getUser = () => {
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
  update = () => {
    this.updated(true);
  };

  submit = () => {
    const currentProfile: EditableProfile = {
      firstName: this.user().firstName,
      lastName: this.user().lastName,
      email: this.user().email,
    };

    // Validar campos obligatorios
    if (hasEmptyRequiredProfileFields(currentProfile)) {
      showLogAlert("All fields are required", "#f44336");
      return;
    }

    if (!hasOnlyAlphabeticNames(currentProfile)) {
      showLogAlert("First and last names can only contain letters (A-Z, a-z, and accents)", "#f44336");
      return;
    }

    // Validar formato del email
    if (!isValidEmailFormat(currentProfile.email)) {
      showLogAlert("The email format is not valid", "#f44336");
      return;
    }

    // Validar cambios en el perfil
    if (!hasProfileChanges(this.originalProfile, currentProfile)) {
      showLogAlert("You must change at least one field", "#f44336");
      return;
    }

    const updateURL =
      "http://localhost:8080/api/v1/users/update";
  
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
        if (!response.ok) throw new Error("Error en OSB");
  
        showLogAlert("User updated successfully", "#1D4355");

        const updatedUser = payload.User[0];
  
        sessionStorage.setItem(
          "user",
          JSON.stringify({
            id: updatedUser.id,
            userId: updatedUser.id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            roleId: this.user().role.id,
            roleName: this.user().role.name,
            boards: this.user().boards
          })
        );

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
        showLogAlert("Error updating the user in OSB", "#f44336");
      });
  };

  logout = () => {
    sessionStorage.clear();
    window.location.href = "http://localhost:8000";
  };
}

export = ProfileViewModel;