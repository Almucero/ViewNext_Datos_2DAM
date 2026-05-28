/**
 * Archivo: ts/viewModels/admin.ts
 * Proposito: Define logica de UI, estado observable, validaciones y llamadas async de este modulo.
 * Nota: Los comentarios priorizan flujo, side-effects y decisiones de integracion.
 */
import ko = require("knockout");
import "ojs/ojbutton";
import "ojs/ojdialog";
import { ojDialog } from "ojs/ojdialog";
import "ojs/ojformlayout";
import "ojs/ojinputtext";
import { KeySetImpl } from "ojs/ojkeyset";
import "ojs/ojknockout";
import "ojs/ojlabel";
import "ojs/ojlistview";
import { ojListView } from "ojs/ojlistview";
import { Collection, Model } from "ojs/ojmodel";
import "ojs/ojselectcombobox";
import "ojs/ojselectsingle";
import CollectionDataProvider = require("ojs/ojcollectiondataprovider");
import ArrayDataProvider = require("ojs/ojarraydataprovider");

type Role = {
  id: number;
  name: string;
};

type Board = {
  id: number;
  name: string;
};

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

function showLogAlert(message: string, backgroundColor: string) {
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

// ViewModel principal: concentra estado observable, eventos de UI y orquestacion de servicios.
class AdminViewModel {
  userLogin: ko.Observable<User>;
  user: ko.Observable<User>;
  userID: string;
  emailAux: String;

  t = (key: string): string => {
    const i18n = (window as any).hiveI18n;
    return i18n && typeof i18n.t === "function" ? i18n.t(key) : key;
  };

  userSelected = ko.observable(false);
  selectedUser = ko.observable<User | null>(null);
  firstSelectedUser = ko.observable();
  private usersApiBase = "http://localhost:8080/api/v1/users";

  // Observables para los User
  private userCol: ko.Observable = ko.observable();
  userDatasourse: ko.Observable = ko.observable();
/*
  private readonly role = [
    { value: "1", label: "ROLE_ADMIN" },
    { value: "2", label: "ROLE_DEVELOPER" },
  ];

  readonly rolesDP = new ArrayDataProvider(this.role, {
    keyAttributes: "value",
  });

  // HACER AUTOMATICO
  private readonly boards = [
    { value: "77", label: "ORACLE JET" },
    { value: "109", label: "SPRING BOOT" },
  ];
  readonly boardsDP = new ArrayDataProvider(this.boards, {
    keyAttributes: "value",
  });*/
  // Inicializa observables, adapta datos de sesion y dispara cargas iniciales.
  constructor() {
    this.emailAux = "";
    const ssUser = sessionStorage.getItem("user");
    const jsonObject = JSON.parse(ssUser as string);
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
      .catch((error: Error) => {
        console.error("Error al cargar la colección:", error);
      });
    this.userDatasourse(new CollectionDataProvider(this.userCol()));
  }

  public inicializar = () => {
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

  createCollectionUser = () => {
    const parseSaveUser = (response: User) => {
      return {
        ...response,
      };
    };

    const parseUser = (response: any) => {
      return {
        ...response,
        userId: Number(response.userId ?? response.id ?? 0),
        role: response.role ?? {
          id: Number(response.roleId ?? 0),
          name: "",
        },
        boards: response.boards ?? { board: [] },
      };
    };

    const restServerURLUsers = "http://localhost:8080/api/v1/users/get-all";

    let UserCollection = Collection.extend({
      url: restServerURLUsers,
      model: Model.extend({
        urlRoot: restServerURLUsers,
        parse: parseUser,
        parseSave: parseSaveUser,
        idAttribute: "id",
      }),
      comparator: "id",
    });

    return new UserCollection();
  };

  getUser = () => {
    let model = this.userCol().get(this.userID);
    if (!model) {
      return;
    }

    let boardsData = model.get("boards");

    // Mapear los tableros si existen
    let boards = boardsData
      ? boardsData.board.map((board: any) => ({
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
        id: Number(model.get("roleId") ?? model.get("role")?.id ?? 0),
        name: model.get("role")?.name ?? "",
      },
      boards: {
        board: boards,
      },
    };

    this.userLogin(userAux);
  };

  private resolveRoleId = (): number => {
    const role = this.user().role as any;
    if (typeof role === "number") return role;
    if (role && typeof role.id !== "undefined") return Number(role.id) || 3;
    return 3;
  };

  private normalizePassword = (password: string): string => {
    const value = String(password ?? "");
    if (value.startsWith("{noop}")) {
      return value.replace("{noop}", "");
    }
    return value;
  };

  private refreshUsers = async () => {
    await this.userCol().fetch();
    this.userDatasourse(new CollectionDataProvider(this.userCol()));
  };

  openCreateUserDialog = () => {
    if (this.user().email != "") this.inicializar();
    (document.getElementById("createUserDialog") as ojDialog).open();
  };

  openAsignDialog = () => {
    (document.getElementById("AsignBoardDialog") as ojDialog).open();
  };

  closeAsignDialog = () => {
    (document.getElementById("AsignBoardDialog") as ojDialog).close();
  };

  closeCreateUserDialog = () => {
    (document.getElementById("createUserDialog") as ojDialog).close();
  };

  openUpdateUserDialog = () => {
    (document.getElementById("editDialog") as ojDialog).open();
  };

  closeUpdateUserDialog = () => {
    (document.getElementById("editDialog") as ojDialog).close();
  };

  closeEmailDialog = () => {
    (document.getElementById("emailDialog") as ojDialog).close();
  };

  openDeleteUserDialog = () => {
    (document.getElementById("deleteUserDialog") as ojDialog).open();
  };

  closeDeleteUserDialog = () => {
    (document.getElementById("deleteUserDialog") as ojDialog).close();
  };

  addUser = () => {
    const users = this.userCol().toJSON() || [];
    const maxId = users.reduce((acc: number, item: any) => {
      const id = Number(item.id ?? 0);
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
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        await this.refreshUsers();
        showLogAlert("User created successfully", "#1D4355");
        this.closeCreateUserDialog();
      })
      .catch(() => {
        showLogAlert(
          "Error creating the user. Please try again.",
          "#f44336"
        );
      });
  };

  selectUser = async (
    event: ojListView.selectedChanged<User["userId"], User>
  ) => {
    let itemContext = event.detail.value;

    if (itemContext != null) {
      const keys = (itemContext as KeySetImpl<User["userId"]>).keys
        .keys as Set<number>;

      const selectedUser = await this.userDatasourse().fetchByKeys({ keys });

      this.user({
        userId: selectedUser.results.get(Array.from(keys.values())[0]).data.id,
        ...selectedUser.results.get(Array.from(keys.values())[0]).data,
      });
      this.emailAux = this.user().email;

      this.userSelected(true);
    } else {
      this.userSelected(false);
    }
  };
  // Operacion de escritura: valida entrada, invoca API y actualiza colecciones locales.
updateUser = async () => {
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
      (document.getElementById("emailDialog") as ojDialog).open();
      abierto = true;
    }

    if (abierto == false) {
      fetch(`${this.usersApiBase}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(async (response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          await this.refreshUsers();
          showLogAlert("User updated successfully", "#1D4355");
          (document.getElementById("editDialog") as ojDialog).close();
        })
        .catch(() => {
          showLogAlert(
            "Error: missing data. Please fill in all fields.",
            "#f44336"
          );
        });
    }
  };
  // Operacion de escritura: valida entrada, invoca API y actualiza colecciones locales.
updateEmailUser = async () => {
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
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        await this.refreshUsers();
        showLogAlert("User updated successfully", "#1D4355");
        (document.getElementById("editDialog") as ojDialog).close();
        (document.getElementById("emailDialog") as ojDialog).close();
      })
      .catch(() => {
        showLogAlert(
          "Error: missing data. Please fill in all fields.",
          "#f44336"
        );
      });
  };

  asignar = async () => {
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
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        await this.refreshUsers();
        showLogAlert("Board assigned successfully", "#1D4355");
        (document.getElementById("AsignBoardDialog") as ojDialog).close();
      })
      .catch(() => {
        showLogAlert(
          "Error: faltan datos. Por favor, rellene todos los campos.",
          "#f44336"
        );
      });
  };

  deleteUser = () => {
    fetch(`${this.usersApiBase}/delete/${this.user().userId}`, {
      method: "DELETE",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        await this.refreshUsers();
        showLogAlert("User deleted successfully", "#1D4355");
        this.userSelected(false);
        this.closeDeleteUserDialog();
      })
      .catch(() => {
        showLogAlert("Error deleting user", "#f44336");
      });
  };

  getBoards = (boardList: Board[]) => {
    let res = "";
    boardList.forEach((board) => {
      res += board.name + ", ";
    });
    res = res.substring(0, res.length - 2);
    return res;
  };
}

export = AdminViewModel;
