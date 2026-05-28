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

    const parseUser = (response: User) => {
      return {
        ...response,
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
        id: model.get("role").id,
        name: model.get("role").name,
      },
      boards: {
        board: boards,
      },
    };

    this.userLogin(userAux);
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
    console.log(this.user());
    let boardIds = [];
    for (let i = 1; i < this.user().boards.board.length; i++) {
      boardIds.push(this.user().boards.board[i]);
    }

    const newUser = {
      email: this.user().email,
      firstName: this.user().firstName,
      lastName: this.user().lastName,
      password: "{noop}" + this.user().password,
      roleId: this.user().role,
      boards: this.user().boards
        ? {
            boardId: boardIds,
          }
        : null,
    };

    console.log("Datos que se van a enviar: ", JSON.stringify(newUser));

    this.userCol().create(newUser, {
      method: "POST",
      wait: true,
      contentType: "application/json; charset=UTF-8",
      success: (model: Model, response: Response) => {
        showLogAlert("User created successfully", "#1D4355");
        this.closeCreateUserDialog();
      },
      error: (model: Model, response: Response) => {
        showLogAlert(
          "Error creating the user. Please try again.",
          "#f44336"
        );
      },
    });
  };

  selectUser = async (
    event: ojListView.selectedChanged<User["userId"], User>
  ) => {
    console.log(event.detail.value);
    let itemContext = event.detail.value;

    if (itemContext != null) {
      const keys = (itemContext as KeySetImpl<User["userId"]>).keys
        .keys as Set<number>;

      const selectedUser = await this.userDatasourse().fetchByKeys({ keys });

      console.log("ENTRO");

      this.user({
        userId: selectedUser.results.get(Array.from(keys.values())[0]).data.id,
        ...selectedUser.results.get(Array.from(keys.values())[0]).data,
      });
      console.log(this.user());
      this.emailAux = this.user().email;

      this.userSelected(true);
    } else {
      this.userSelected(false);
    }
  };
  // Operacion de escritura: valida entrada, invoca API y actualiza colecciones locales.
updateUser = async () => {
    let abierto = false;
    const myModel = this.userCol().get(this.user().userId);
    let boardIds = [];
    for (let i = 1; i < this.user().boards.board.length; i++) {
      boardIds.push(this.user().boards.board[i]);
    }

    if (!this.user().password.startsWith("{noop}")) {
      this.user().password = "{noop}" + this.user().password;
    }

    console.log(this.user());

    const row = {
      userId: this.user().userId,
      email: this.user().email,
      firstName: this.user().firstName,
      lastName: this.user().lastName,
      password: this.user().password,
      roleId: this.user().role,
      boards: this.user().boards
        ? {
            boardId: boardIds,
          }
        : null,
    };

    if (this.emailAux != this.user().email) {
      (document.getElementById("emailDialog") as ojDialog).open();
      abierto = true;
    }

    console.log(row);

    if (abierto == false) {
      myModel.save(row, {
        wait: true,
        contentType: "application/json; charset=UTF-8",

        success: (model: Model, response: Response) => {
          console.log("User updated successfully:", response);
          showLogAlert("User updated successfully", "#1D4355");
          (document.getElementById("editDialog") as ojDialog).close();
        },
        error: (model: Model, response: Response) => {
          showLogAlert(
            "Error: missing data. Please fill in all fields.",
            "#f44336"
          );
        },
      });
    }

    console.log(this.user());
  };
  // Operacion de escritura: valida entrada, invoca API y actualiza colecciones locales.
updateEmailUser = async () => {
    const myModel = this.userCol().get(this.user().userId);
    let boardIds = [];
    for (let i = 1; i < this.user().boards.board.length; i++) {
      boardIds.push(this.user().boards.board[i]);
    }

    if (!this.user().password.startsWith("{noop}")) {
      this.user().password = "{noop}" + this.user().password;
    }

    console.log(this.user());
    const row = {
      userId: this.user().userId,
      email: this.user().email,
      firstName: this.user().firstName,
      lastName: this.user().lastName,
      password: this.user().password,
      roleId: this.user().role,
      boards: this.user().boards
        ? {
            boardId: boardIds,
          }
        : null,
    };

    console.log(row);

    myModel.save(row, {
      wait: true,
      contentType: "application/json; charset=UTF-8",

      success: (model: Model, response: Response) => {
        console.log("User updated successfully:", response);
        showLogAlert("User updated successfully", "#1D4355");
        (document.getElementById("editDialog") as ojDialog).close();
      },
      error: (model: Model, response: Response) => {
        showLogAlert(
          "Error: missing data. Please fill in all fields.",
          "#f44336"
        );
      },
    });

    (document.getElementById("emailDialog") as ojDialog).close();

    console.log(this.user());
  };

  asignar = async () => {
    const myModel = this.userCol().get(this.user().userId);
    let boardIds = [];
    for (let i = 1; i < this.user().boards.board.length; i++) {
      boardIds.push(this.user().boards.board[i]);
    }

    if (!this.user().password.startsWith("{noop}")) {
      this.user().password = "{noop}" + this.user().password;
    }
    console.log(this.user());

    const row = {
      userId: this.user().userId,
      email: this.user().email,
      firstName: this.user().firstName,
      lastName: this.user().lastName,
      password: this.user().password,
      roleId: this.user().role.id,
      boards: this.user().boards
        ? {
            boardId: boardIds,
          }
        : null,
    };

    console.log(row);

    myModel.save(row, {
      wait: true,
      contentType: "application/json; charset=UTF-8",

      success: (model: Model, response: Response) => {
        console.log("User updated successfully:", response);
        showLogAlert("Board assigned successfully", "#1D4355");
        (document.getElementById("AsignBoardDialog") as ojDialog).close();
      },
      error: (model: Model, response: Response) => {
        showLogAlert(
          "Error: faltan datos. Por favor, rellene todos los campos.",
          "#f44336"
        );
      },
    });

    console.log(this.user());
  };

  deleteUser = () => {
    console.log(this.user());
    const myModel = this.userCol().get(this.user().userId);
    console.log(myModel);

    if (myModel) {
      this.userCol().remove(myModel);
      myModel.destroy().then(() => {
        showLogAlert("User deleted successfully", "#1D4355");
        this.userSelected(false);
        this.closeDeleteUserDialog();
      });
    }
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
