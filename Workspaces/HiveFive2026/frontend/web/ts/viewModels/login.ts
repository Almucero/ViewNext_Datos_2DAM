/**
 * Archivo: ts/viewModels/login.ts
 * Proposito: Define logica de UI, estado observable, validaciones y llamadas async de este modulo.
 * Nota: Los comentarios priorizan flujo, side-effects y decisiones de integracion.
 */
/// <amd-module name="loginViewModel"/>


declare var define: any;

interface Usuario {
  id: number;
  roleId: number;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

define(["require", "exports", "knockout", "viewModels/login.validation"], function (
  require: any,
  exports: any,
  ko: typeof import("knockout"),
  loginValidation: { isValidLoginEmailFormat: (email: string) => boolean }
) {

  class LoginViewModel {

    user = {
      email: ko.observable<string>(""),
      password: ko.observable<string>("")
    };

    mensaje = ko.observable<string>("");

    t = (key: string): string => {
      const i18n = (window as any).hiveI18n;
      return i18n && typeof i18n.t === "function" ? i18n.t(key) : key;
    };
  // Inicializa observables, adapta datos de sesion y dispara cargas iniciales.
  constructor() { }

    goToSignup = (_data?: unknown, event?: Event) => {
      event?.preventDefault();
      window.location.href = "?ojr=signup";
      return false;
    };

    acceder = () => {
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
        .then((data: { User: Usuario[] }) => {

          const usuarios = data.User;

          const usuario = usuarios.find((u: Usuario) =>
            u.email === email && u.password === password
          );

          if (!usuario) {
            this.mensaje("Usuario o contraseña incorrectos");
            return;
          }

          // ✅ Guardar usuario en sessionStorage
          sessionStorage.setItem("user", JSON.stringify({
            userId: usuario.id,         // ✅ Convertimos id → userId
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

  return LoginViewModel;
});