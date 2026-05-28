/**
 * Archivo: ts/viewModels/signup.ts
 * Proposito: Define logica de UI, estado observable, validaciones y llamadas async de este modulo.
 * Nota: Los comentarios priorizan flujo, side-effects y decisiones de integracion.
 */
/// <amd-module name="signupViewModel"/>

declare var define: any;

interface Usuario {
  id: number;
  roleId: number;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

function showLogAlert(message: string, backgroundColor: string) {
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

define(
  ["require", "exports", "knockout", "viewModels/login.validation", "viewModels/signup.validation"],
  function (
    require: any,
    exports: any,
    ko: typeof import("knockout"),
    loginValidation: { isValidLoginEmailFormat: (email: string) => boolean },
    signupValidation: {
      hasEmptyRequiredSignupFields: (signupData: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
      }) => boolean;
      hasOnlyAlphabeticNames: (signupData: { firstName: string; lastName: string }) => boolean;
    }
  ) {
    class SignupViewModel {
      user = {
        firstName: ko.observable<string>(""),
        lastName: ko.observable<string>(""),
        email: ko.observable<string>(""),
        password: ko.observable<string>("")
      };

      mensaje = ko.observable<string>("");
      isSubmitting = ko.observable<boolean>(false);

      t = (key: string): string => {
        const i18n = (window as any).hiveI18n;
        return i18n && typeof i18n.t === "function" ? i18n.t(key) : key;
      };

      private usersURL = "http://localhost:8080/api/v1/users/get-all";
      private createURLs = [
        "http://localhost:8080/api/v1/users/create"
      ];
  // Inicializa observables, adapta datos de sesion y dispara cargas iniciales.
  constructor() {}

      private resetForm = () => {
        this.user.firstName("");
        this.user.lastName("");
        this.user.email("");
        this.user.password("");
      };

      private getUsers = async (): Promise<Usuario[]> => {
        const response = await fetch(this.usersURL);
        if (!response.ok) {
          throw new Error("Could not retrieve the user list");
        }

        const data = await response.json();
        return Array.isArray(data?.User) ? data.User : [];
      };

      private createUserInApi = async (payload: { User: Usuario[] }): Promise<void> => {
        let lastStatus = "";

        for (const endpoint of this.createURLs) {
          const response = await fetch(endpoint, {
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
      };

      registrar = async () => {
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
          const usuarios = await this.getUsers();
          const alreadyExists = usuarios.some(
            (u) => String(u.email ?? "").trim().toLowerCase() === currentUser.email.toLowerCase()
          );

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

          await this.createUserInApi(payload);

          this.resetForm();
          showLogAlert("Usuario registrado correctamente", "#1D4355");
          window.setTimeout(() => {
            window.location.href = "?ojr=login";
          }, 2000);
        } catch (error) {
          console.error("Error al registrar usuario:", error);
          showLogAlert("Could not register the user at this time", "#f44336");
        } finally {
          this.isSubmitting(false);
        }
      };
    }

    return SignupViewModel;
  }
);
