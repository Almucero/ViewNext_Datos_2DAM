/**
 * Archivo: ts/viewModels/boardsList.ts
 * Proposito: Define logica de UI, estado observable, validaciones y llamadas async de este modulo.
 * Nota: Los comentarios priorizan flujo, side-effects y decisiones de integracion.
 */
import 'ojs/ojbutton';
import { ojButton } from "ojs/ojbutton";
import "ojs/ojdialog";
import { ojDialog } from "ojs/ojdialog";
import "ojs/ojformlayout";
import "ojs/ojinputtext";
import { KeySetImpl } from "ojs/ojkeyset";
import "ojs/ojlabelvalue";
import "ojs/ojlistview";
import { ojListView } from "ojs/ojlistview";
import { Collection, Model } from "ojs/ojmodel";
import "ojs/ojselectcombobox";
import "ojs/ojselectsingle";
import ko = require("knockout");
import CollectionDataProvider = require("ojs/ojcollectiondataprovider");
import AsyncLengthValidator = require("ojs/ojasyncvalidator-length");
import ArrayDataProvider = require("ojs/ojarraydataprovider");
import {
  canDeleteBoard,
  isBoardNameChanged,
  isBoardNameNotEmpty,
  normalizeBoardName,
} from "./boardsList.validation";

declare var $: any;

type Role = { id: number; name: string };
type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  boards: Board[];
};
type Board = { id: number; name: string; users: User[] };
type Status = { id: number; name: string };
type Card = {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  priority: number;
  board: Board;
  status: Status;
  user: User;
};

function showLogAlert(msg: string, color: string) {
  const div = document.createElement("div");
  div.className = "custom-log-alert";
  div.textContent = msg;
  div.style.backgroundColor = color;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 2000);
}

// ViewModel principal: concentra estado observable, eventos de UI y orquestacion de servicios.
class BoardsListViewModel {
  // Usuario autenticado actual (id usado en filtrado de boards y asignaciones).
  userID: string;

  // Endpoints API usados por el modulo.
  ServerURLBoardsGet = "http://localhost:8080/api/v1/boards/get-all";
  ServerURLBoardsUpdate = "http://localhost:8080/api/v1/boards/update";
  ServerURLCards = "http://localhost:8080/api/v1/cards/get-all";
  ServerURLUserBoardCreate = "http://localhost:8080/api/v1/user-boards/create";
  ServerURLUserBoardDelete = "http://localhost:8080/api/v1/user-boards/delete";
  ServerURLUserBoardGetAll = "http://localhost:8080/api/v1/user-boards/get-all";

  // Estado principal de vista.
  user: ko.Observable<User>;
  board: ko.Observable<Board>;
  boardCol: ko.Observable = ko.observable();
  boardSource: ko.Observable = ko.observable();
  cardCol: ko.Observable = ko.observable();
  isLoadingBoards: ko.Observable<boolean> = ko.observable(true);
  boardCount: ko.Observable<number>;
  skeletons: ko.ObservableArray<number>;

  sendBoardId: ko.Observable<number>;
  receivedBoardId: ko.Observable<number>;

  validatorTitle: ko.ObservableArray<any>;
  browsersBoard: any[];
  boardsDPSend: ko.Observable<any>;
  boardsDPReceive: ko.Observable<any>;
  lastGeneratedBoardId: number;
  originalBoardName: string;
  userBoardIds: Set<number> = new Set();

  // Helper de traduccion compartido con appController.
  t = (key: string): string => {
    const i18n = (window as any).hiveI18n;
    return i18n && typeof i18n.t === "function" ? i18n.t(key) : key;
  };
  // Inicializa observables, adapta datos de sesion y dispara cargas iniciales.
  constructor() {
    // Validador de longitud para nombre de board en dialogs de alta/edicion.
    this.validatorTitle = ko.observableArray([new AsyncLengthValidator({ min: 4, max: 30 })]);

    // Identificadores de board usados en dialogo de mover/exportar.
    this.sendBoardId = ko.observable(0);
    this.receivedBoardId = ko.observable(0);

    // Hidrata usuario desde sessionStorage (source of truth de sesion).
    const ssUser = sessionStorage.getItem("user");
    const json = JSON.parse(ssUser as string);

    this.userID = json.userId;

    this.user = ko.observable<User>({
      id: json.userId,
      email: json.email,
      firstName: json.firstName,
      lastName: json.lastName,
      role: { id: json.roleId, name: json.roleName },
      boards: json.boards
    });

    this.board = ko.observable<Board>({ id: 0, name: "", users: [] });

    // Inicializa colecciones Backbone + providers para OJ ListView.
    this.boardCol(this.createCollectionBoard());
    this.cardCol(this.createCollectionCards());

    this.boardSource(new CollectionDataProvider(this.boardCol()));

    // Skeleton adaptativo: recuerda ultimo volumen para evitar saltos bruscos.
    const savedBoardCount = Number(sessionStorage.getItem("lastBoardCount"));
    const initialBoardCount = Number.isFinite(savedBoardCount) && savedBoardCount > 0 ? savedBoardCount : 4;
    this.boardCount = ko.observable(initialBoardCount);
    this.skeletons = ko.observableArray(Array.from({ length: initialBoardCount }, (_v, i) => i));

    // Providers auxiliares para selects "From" y "To" del export/move.
    this.browsersBoard = [];
    this.boardsDPSend = ko.observable(
      new ArrayDataProvider([], { keyAttributes: "value" })
    );
    this.boardsDPReceive = ko.observable(
      new ArrayDataProvider([], { keyAttributes: "value" })
    );

    this.lastGeneratedBoardId = 0;
    this.originalBoardName = "";

    // Carga secuencial: primero permisos/links usuario-board, luego boards visibles.
    this.fetchUserBoardsFirst().then(() => {
      this.fetchBoardsManual();
    });

    (window as any).boardsListVM = this;
  }

  /* Normalizadores */
  private parseBoard = (response: any) => {
    // Normaliza payloads heterogeneos (Board anidado o plano).
    const b = response.Board ? response.Board : response;
    return { ...b, id: Number(b.id) };
  };
  /*private parseSaveBoard = (response: any) => {
    const b = response.Board ? response.Board : response;
    return { ...b, id: Number(b.id) };
  };*/
  private parseCard = (response: any) => ({ ...response, id: Number(response.id) });
  //private parseSaveCard = (response: any) => ({ ...response, id: Number(response.id) });

  private extractBoardsFromText = (txt: string): Array<{ id: number; name: string }> => {
    // Estrategia 1: parse estructurado JSON en sus variantes conocidas.
    try {
      const parsed = JSON.parse(txt);

      const normalizeBoards = (arr: any[]) =>
        arr
          .map((b: any) => ({ id: Number(b?.id), name: String(b?.name ?? "") }))
          .filter((b: { id: number }) => Number.isFinite(b.id));

      if (Array.isArray(parsed)) {
        return normalizeBoards(parsed);
      }

      if (Array.isArray(parsed?.Board)) {
        return normalizeBoards(parsed.Board);
      }

      if (Array.isArray(parsed?.BoardCollection?.Board)) {
        return normalizeBoards(parsed.BoardCollection.Board);
      }

      if (Array.isArray(parsed?.Boards)) {
        return normalizeBoards(parsed.Boards);
      }

      if (parsed?.Board) {
        const id = Number(parsed.Board.id);
        return Number.isFinite(id) ? [{ id, name: String(parsed.Board.name ?? "") }] : [];
      }

      if (parsed?.BoardCollection?.Board) {
        const b = parsed.BoardCollection.Board;
        const id = Number(b.id);
        return Number.isFinite(id) ? [{ id, name: String(b.name ?? "") }] : [];
      }
    } catch {
    }

    // Estrategia 2: fallback robusto por scanning textual cuando el backend responde mixto.
    const boards: Array<{ id: number; name: string }> = [];
    let cursor = 0;

    while (cursor < txt.length) {
      const boardKeyIdx = txt.indexOf('"Board"', cursor);
      if (boardKeyIdx === -1) break;

      const colonIdx = txt.indexOf(":", boardKeyIdx);
      if (colonIdx === -1) break;

      const startIdx = txt.indexOf("{", colonIdx);
      if (startIdx === -1) break;

      let depth = 0;
      let endIdx = -1;
      for (let i = startIdx; i < txt.length; i++) {
        const ch = txt[i];
        if (ch === "{") depth++;
        if (ch === "}") {
          depth--;
          if (depth === 0) {
            endIdx = i;
            break;
          }
        }
      }

      if (endIdx === -1) break;

      const objText = txt.slice(startIdx, endIdx + 1);
      try {
        const board = JSON.parse(objText);
        const id = Number(board.id);
        if (Number.isFinite(id)) {
          boards.push({ id, name: String(board.name ?? "") });
        }
      } catch {
      }

      cursor = endIdx + 1;
    }

    if (boards.length) return boards;

    return [];
  };

  private setBoardCount = (count: number) => {
    // Mantiene skeleton en linea con cantidad real de boards.
    const normalizedCount = Number.isFinite(count) && count > 0 ? count : 4;
    this.boardCount(normalizedCount);
    this.skeletons(Array.from({ length: normalizedCount }, (_v, i) => i));
    sessionStorage.setItem("lastBoardCount", String(normalizedCount));
  };

  private extractIdsFromRawText = (txt: string): number[] => {
    // Extrae ids tanto en formato JSON como XML.
    const matches = txt.match(/"id"\s*:\s*"?(\d+)"?/g) || [];
    const jsonStyleIds = matches
      .map((m) => {
        const n = Number((m.match(/(\d+)/) || [])[0]);
        return Number.isFinite(n) ? n : NaN;
      })
      .filter((n) => Number.isFinite(n));

    const xmlStyle = txt.match(/<[^>]*:?id>\s*(\d+)\s*<\/[^>]*:?id>/gi) || [];
    const xmlStyleIds = xmlStyle
      .map((m) => {
        const n = Number((m.match(/(\d+)/) || [])[0]);
        return Number.isFinite(n) ? n : NaN;
      })
      .filter((n) => Number.isFinite(n));

    return Array.from(new Set([...jsonStyleIds, ...xmlStyleIds]));
  };

  private collectKnownBoardIds = (): number[] => {
    // Fusiona ids conocidos de coleccion, usuario en memoria y sessionStorage.
    const ids: number[] = [];

    if (this.boardCol() && this.boardCol().models) {
      this.boardCol().models.forEach((board: any) => {
        const id = Number(board.get("id"));
        if (Number.isFinite(id)) ids.push(id);
      });
    }

    const userBoardsRaw = this.user()?.boards as any;
    const userBoards = Array.isArray(userBoardsRaw)
      ? userBoardsRaw
      : Array.isArray(userBoardsRaw?.board)
        ? userBoardsRaw.board
        : [];

    userBoards.forEach((b: any) => {
      const id = Number(b?.id);
      if (Number.isFinite(id)) ids.push(id);
    });

    try {
      const ssUser = sessionStorage.getItem("user");
      if (ssUser) {
        const parsed = JSON.parse(ssUser);
        const arr = Array.isArray(parsed?.boards) ? parsed.boards : [];
        arr.forEach((b: any) => {
          const id = Number(b?.id);
          if (Number.isFinite(id)) ids.push(id);
        });
      }
    } catch {
    }

    return Array.from(new Set(ids));
  };

  /* COLLECTIONS */
  createCollectionBoard = () => {
    // Coleccion de boards con parse custom.
    const MyBoardCollection = Collection.extend({
      url: this.ServerURLBoardsGet,
      model: Model.extend({
        urlRoot: "",
          customURL: () => {
          return "http://localhost:8080/api/v1/boards/update";
        },
        parse: this.parseBoard,
        idAttribute: "id"
      }),
      comparator: "id"
    });
  
    return new MyBoardCollection();
  };

  createCollectionCards = () => {
    // Coleccion de cards usada para validaciones cruzadas (ej: delete board).
    const MyCardCollection = Collection.extend({
      url: this.ServerURLCards,
      model: Model.extend({
        urlRoot: this.ServerURLCards,
        parse: this.parseCard,
        idAttribute: "id"
      }),
      comparator: "id"
    });
    return new MyCardCollection();
  };

  /* USER BOARD MANAGEMENT */
  // Flujo async: consulta backend, normaliza datos y sincroniza estado de pantalla.
private fetchUserBoardsFirst = async (): Promise<void> => {
    // Carga relacion usuario-board para filtrar boards visibles al usuario actual.
    try {
      const txt = await $.ajax({
        url: this.ServerURLUserBoardGetAll,
        method: "GET",
        dataType: "text",
        beforeSend: (xhr: any) => {
          if (xhr && xhr.overrideMimeType) xhr.overrideMimeType("text/plain; charset=UTF-8");
        },
        converters: { "* text": (res: any) => res }
      });

      this.userBoardIds = this.extractUserBoardIds(txt as string, Number(this.userID));
    } catch (e) {
      console.error("❌ fetchUserBoardsFirst:", e);
      this.userBoardIds = new Set();
    }
  };

  private extractUserBoardIds = (txt: string, userId: number): Set<number> => {
    // Soporta tanto XML namespaced como JSON de distintos endpoints.
    const boardIds = new Set<number>();
    try {
      // Try to parse as XML first
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(txt, "text/xml");
      
      if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
        // If XML parsing fails, try JSON
        const parsed = JSON.parse(txt);
        const userBoards = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.UserBoard) ? parsed.UserBoard : [];
        
        userBoards.forEach((ub: any) => {
          const fetchedUserId = Number(ub?.userId ?? ub?.user_id);
          const boardId = Number(ub?.boardId ?? ub?.board_id);
          if (fetchedUserId === userId && Number.isFinite(boardId)) {
            boardIds.add(boardId);
          }
        });
      } else {
        // Parse XML with namespaces
        const userBoardNodes = xmlDoc.getElementsByTagName("ns0:UserBoard");
        
        for (let i = 0; i < userBoardNodes.length; i++) {
          const node = userBoardNodes[i];
          const boardIdNode = node.getElementsByTagName("ns0:boardId")[0];
          const userIdNode = node.getElementsByTagName("ns0:userId")[0];
          
          if (boardIdNode && userIdNode) {
            const fetchedUserId = Number(userIdNode.textContent);
            const boardId = Number(boardIdNode.textContent);
            
            if (fetchedUserId === userId && Number.isFinite(boardId)) {
              boardIds.add(boardId);
            }
          }
        }
      }
    } catch (e) {
      console.error("Error parsing user boards XML/JSON:", e);
    }
    return boardIds;
  };

  private createUserBoard = (userId: number, boardId: number): Promise<boolean> => {
    // Inserta relacion usuario-board tras crear board.
    return new Promise((resolve) => {
      const payload = {
        boardId: boardId,
        userId: userId
      };

      $.ajax({
        url: this.ServerURLUserBoardCreate,
        method: "POST",
        contentType: "application/json",
        headers: { Accept: "application/json" },
        data: JSON.stringify(payload),
        success: () => {
          this.userBoardIds.add(boardId);
          resolve(true);
        },
        error: (err: any) => {
          console.error(`❌ Error creating user board:`, err);
          resolve(false);
        }
      });
    });
  };

  private deleteUserBoard = (userId: number, boardId: number): Promise<boolean> => {
    // Elimina relacion usuario-board tras borrar board.
    return new Promise((resolve) => {
      const payload = {
        boardId: boardId,
        userId: userId
      };

      $.ajax({
        url: this.ServerURLUserBoardDelete,
        method: "POST",
        contentType: "application/json",
        headers: { Accept: "application/json" },
        data: JSON.stringify(payload),
        success: () => {
          this.userBoardIds.delete(boardId);
          resolve(true);
        },
        error: (err: any) => {
          console.error(`❌ Error deleting user board:`, err);
          resolve(false);
        }
      });
    });
  };

  async fetchBoardsManual() {
    // Carga boards desde backend y filtra solo los vinculados al usuario actual.
    this.isLoadingBoards(true);
    try {
      const txt = await $.ajax({
        url: this.ServerURLBoardsGet,
        method: "GET",
        dataType: "text",
        beforeSend: (xhr: any) => {
          if (xhr && xhr.overrideMimeType) xhr.overrideMimeType("text/plain; charset=UTF-8");
        },
        converters: { "* text": (res: any) => res }
      });

      let items = this.extractBoardsFromText(txt as string);
      
      // Visibilidad por pertenencia: evita listar boards de otros usuarios.
      items = items.filter((board: any) => this.userBoardIds.has(Number(board.id)));

      this.setBoardCount(items.length);
      this.boardCol().reset(items);

      this.rebuildBoardsProviders();
      this.boardSource(new CollectionDataProvider(this.boardCol()));
    } catch (e) {
      console.error("❌ fetchBoardsManual:", e);
    } finally {
      this.isLoadingBoards(false);
    }
  }

  /* Helper DataProviders */
  private rebuildBoardsProviders() {
    // Reconstituye providers de selects evitando duplicados por id.
    const unique = new Map<number, { value: number; label: string }>();
    this.boardCol().models.forEach((board: any) => {
      const id = Number(board.get("id"));
      if (!unique.has(id)) {
        unique.set(id, {
          value: id,
          label: board.get("name")
        });
      }
    });

    const arr = Array.from(unique.values());
    this.boardsDPSend(new ArrayDataProvider(arr, { keyAttributes: "value" }));
    this.boardsDPReceive(new ArrayDataProvider(arr, { keyAttributes: "value" }));
  }

  private refreshBoards = async () => {
    // Wrapper semantico para recarga de boards.
    await this.fetchBoardsManual();
  };

  private getNextBoardId = async (): Promise<number> => {
    // Calcula id global max + 1 para evitar colisiones entre usuarios.
    try {
      // Always fetch ALL boards from the system to get the correct next ID
      // This ensures no ID collisions with boards from other users
      const txt = await $.ajax({
        url: this.ServerURLBoardsGet,
        method: "GET",
        dataType: "text",
        beforeSend: (xhr: any) => {
          if (xhr && xhr.overrideMimeType) xhr.overrideMimeType("text/plain; charset=UTF-8");
        },
        converters: { "* text": (res: any) => res }
      });

      const networkIds = this.extractBoardsFromText(txt as string)
        .map((b) => Number(b.id))
        .filter((id: number) => Number.isFinite(id));

      this.extractIdsFromRawText(txt as string).forEach((id) => networkIds.push(id));

      const uniqueIds = Array.from(new Set(networkIds));

      const maxId = uniqueIds.length ? Math.max(...uniqueIds) : 0;
      this.lastGeneratedBoardId = maxId + 1;
      return this.lastGeneratedBoardId;
    } catch (error) {
      console.error("[getNextBoardId] Error fetching boards:", error);
      // Fallback: increment from local knowledge
      this.lastGeneratedBoardId = Math.max(this.lastGeneratedBoardId + 1, 1);
      return this.lastGeneratedBoardId;
    }
  };

  private getLocalMaxCardId = (): number => {
    // Maximo id en cache local de cards.
    const collection = this.cardCol();
    if (!collection || !collection.models || collection.models.length === 0) {
      return 0;
    }
 
    const ids = collection.models
      .map((cardModel: any) => {
        const raw = cardModel?.toJSON ? cardModel.toJSON() : {};
        return Number(raw?.id ?? raw?.card_id ?? raw?.cardId ?? 0);
      })
      .filter((id: number) => Number.isFinite(id) && id > 0);
 
    return ids.length ? Math.max(...ids) : 0;
  };
 
  private getNextCardId = async (): Promise<number> => {
    // Maximo entre local y remoto para altas de cards consistentes.
    const localMaxId = this.getLocalMaxCardId();
 
    try {
      await this.cardCol().fetch();
 
      const remoteIds = this.cardCol().models
        .map((cardModel: any) => {
          const raw = cardModel?.toJSON ? cardModel.toJSON() : {};
          return Number(raw?.id ?? raw?.card_id ?? raw?.cardId ?? 0);
        })
        .filter((id: number) => Number.isFinite(id) && id > 0);
 
      const remoteMaxId = remoteIds.length ? Math.max(...remoteIds) : 0;
      return Math.max(localMaxId, remoteMaxId) + 1;
    } catch (error) {
      console.warn("Could not calculate the next card id, using local fallback", error);
      return localMaxId + 1;
    }
  };
 

  

  boardChanged = () => {
    // Rehidrata providers cuando cambian valores de seleccion.
    this.rebuildBoardsProviders();
  };

  inicializar = () => {
    // Limpia board temporal del formulario.
    this.board({ id: 0, name: "", users: [] });
  };

  /* DIALOGS */
  showCreateDialog = () => {
    // Abre dialog de creacion reiniciando estado si habia datos previos.
    if (this.board().name !== "") this.inicializar();
    (document.getElementById("createDialog") as ojDialog).open();
  };

  showExportDialog = async () => {
    // Resetea selects de origen/destino y refresca coleccion antes de abrir.
    this.sendBoardId(0);
    this.receivedBoardId(0);
  
    await this.refreshBoards();
  
    (document.getElementById("exportDialog") as ojDialog).open();
  };

  showEditDialog = (
    event?: ojButton.ojAction,
    context?: ojListView.ItemContext<number, Board>) => {

    // Carga board seleccionado en formulario de edicion.
    if (!context || context.key == null) return;

    const id = Number(context.key);
    const m = this.boardCol().get(id);
    if (!m) return;

    this.board({
      id: m.get("id"),
      name: m.get("name"),
      users: m.get("users")
    });
    this.originalBoardName = String(m.get("name") || "");

    (document.getElementById("editDialog") as ojDialog).open();
  };

  /* CRUD */
  // Operacion de escritura: valida entrada, invoca API y actualiza colecciones locales.
createBoard = async () => {
    try {
      const boardName = normalizeBoardName(this.board().name);
      if (!isBoardNameNotEmpty(boardName)) {
        showLogAlert("Board name is required", "#f44336");
        return;
      }

      const nextBoardId = await this.getNextBoardId();
      const payload = {
        Board:[
          {
             "name": boardName,
             "id": nextBoardId
          }
        ]
       
      };
      $.ajax({
        url: "http://localhost:8080/api/v1/boards/create",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(payload),
        success: async () => {
          // Si alta board ok, se crea tambien la relacion usuario-board.
          // Create user_board link
          const created = await this.createUserBoard(Number(this.userID), nextBoardId);
          if (!created) {
            showLogAlert("Board created but linking failed", "#ff9800");
          }
          
          await this.refreshBoards();
          (document.getElementById("createDialog") as ojDialog).close();
          (document.getElementById("cardsHeader") as HTMLElement).focus();
        },
        error: async (err: any) => {
          // Algunos endpoints responden error aunque persisten el recurso.
          // Check if board was actually created despite the error response
          try {
            const txt = await $.ajax({
              url: this.ServerURLBoardsGet,
              method: "GET",
              dataType: "text",
              beforeSend: (xhr: any) => {
                if (xhr && xhr.overrideMimeType) xhr.overrideMimeType("text/plain; charset=UTF-8");
              },
              converters: { "* text": (res: any) => res }
            });

            const boards = this.extractBoardsFromText(txt as string);
            const boardExists = boards.some((b: any) => Number(b.id) === nextBoardId);

            if (boardExists) {
              // Create user_board link
              const created = await this.createUserBoard(Number(this.userID), nextBoardId);
              if (!created) {
                showLogAlert("Board created but linking failed", "#ff9800");
              }
              
              await this.refreshBoards();
              (document.getElementById("createDialog") as ojDialog).close();
              (document.getElementById("cardsHeader") as HTMLElement).focus();
              return;
            }
          } catch (checkError) {
            console.error("Error checking if board was created:", checkError);
          }

          // Si no hay confirmacion de alta, fuerza recarga para re-sincronizar UI.
          setTimeout(() => {
            location.reload();
          }, 5000);
        }
      });
    } catch (err) {
    }
  };

  updateBoard = () => {
    // Valida cambio real de nombre y persiste la edicion en backend.
    const nextName = normalizeBoardName(this.board().name);

    if (!isBoardNameNotEmpty(nextName)) {
      showLogAlert("Board name cannot be empty", "#f44336");
      return;
    }

    if (!isBoardNameChanged(this.originalBoardName, nextName)) {
      showLogAlert("You must change the board name", "#f44336");
      return;
    }

    const payload = {
      Board:[
        {
          "id": this.board().id,
          "name": nextName,
        }
      ]
    };

    $.ajax({
      url: this.ServerURLBoardsUpdate,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(payload),
      success: async (resp: any) => {
        this.originalBoardName = nextName;
        (document.getElementById("editDialog") as ojDialog).close();
        (document.getElementById("cardsHeader") as HTMLElement).focus();
        await this.refreshBoards();
      },
      error: (err: any) => {
        setTimeout(() => {
          location.reload();
        }, 5000);
      }
    });
  };
  // Operacion de escritura: valida entrada, invoca API y actualiza colecciones locales.
deleteBoard = async (
    event?: ojButton.ojAction,
    context?: ojListView.ItemContext<number, Board>,
    move?: boolean
  ) => {
    // Borrado seguro: bloquea si hay cards asociadas en el board.
    let idDelete = this.sendBoardId();
    if (context) idDelete = Number(context.key);
 
    const m = this.boardCol().get(idDelete);
    if (!m) return;

    await this.cardCol().fetch().catch(() => {
    });

    const cardsInBoard = this.getBoardCardCount(idDelete);
    if (!canDeleteBoard(cardsInBoard)) {
      showLogAlert("Cannot delete: the board contains cards", "#f44336");
      return;
    }
 
    // En flujo move el borrado se ejecuta sin confirmacion interactiva.
    const ok = move || window.confirm("Delete board?");
    if (!ok) return;
 
    const urlDelete = `http://localhost:8080/api/v1/boards/delete/${idDelete}`;
 
    fetch(urlDelete, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Error en la respuesta del servidor");
 
        // Delete user_board link
        await this.deleteUserBoard(Number(this.userID), idDelete);
        
        this.boardCol().remove(m);
        showLogAlert("Board deleted", "#1D4355");
 
        this.rebuildBoardsProviders();
      })
      .catch((err) => {
        console.error("Error deleting board:", err);
        showLogAlert("Error deleting board", "#f44336");
      });
  };

  private getBoardCardCount = (boardId: number): number => {
    // Cuenta cards asociadas por board.id anidado o board_id plano.
    if (!this.cardCol() || !this.cardCol().models) return 0;

    return this.cardCol().models.filter((cardModel: any) => {
      const raw = cardModel?.toJSON ? cardModel.toJSON() : {};
      const byNested = Number(raw?.board?.id);
      const byFlat = Number(raw?.board_id ?? raw?.boardId);
      return byNested === Number(boardId) || byFlat === Number(boardId);
    }).length;
  };

  changeBoard = () => {
    // Mueve cards del board origen al destino y elimina el board origen.
    this.cardCol().fetch().then(() => {
      this.cardFilter();

      this.cardCol().fetch().then(async () => {
        try {
          const updateRequests = this.cardCol().map((cardModel: any) => {
            const row = {
              id: cardModel.get("id"),
              title: cardModel.get("title"),
              description: cardModel.get("description"),
              startDate: cardModel.get("startDate"),
              endDate: cardModel.get("endDate"),
              priority: cardModel.get("priority"),
              boardId: this.receivedBoardId(),
              statusId: cardModel.get("status").id,
              userId: cardModel.get("user").id
            };

            return fetch("http://localhost:8080/api/v1/cards/update", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ Card: [row] })
            });
          });

          const responses = await Promise.all(updateRequests);
          const hasErrors = responses.some((response: Response) => !response.ok);
          if (hasErrors) {
            showLogAlert("Error moving cards", "#f44336");
            return;
          }

          showLogAlert("Cards moved", "#1D4355");
          this.deleteBoard(undefined, undefined, true);

          (document.getElementById("exportDialog") as ojDialog).close();
          (document.getElementById("cardsHeader") as HTMLElement).focus();
        } catch (error) {
          showLogAlert("Error moving cards", "#f44336");
        }
      });
    });

    this.refreshBoards().then(() => {
      const send = this.boardCol().get(this.sendBoardId());
      const receive = this.boardCol().get(this.receivedBoardId());
      if (!send || !receive) return;

      this.board().id = this.receivedBoardId();
      this.board().name = receive.get("name");

      const mergedUsers = [
        ...new Set([...receive.get("users"), ...send.get("users")])
      ];

      this.board().users = mergedUsers;

      this.updateBoard();
    });
  };

  cardFilter = () => {
    // Filtra cards por board origen seleccionado para operacion de move.
    this.cardCol().fetch({
      success: (collection: any) => {
        const cards = collection.toJSON() as Card[];
        const filtered = cards.filter((c: Card) =>
          Number(c.board.id) === Number(this.sendBoardId())
        );

        const arr = filtered.map(
          (c: Card) => new (this.cardCol().model)({ ...c, id: Number(c.id) })
        );

        const NewCollection = Collection.extend({
          model: this.cardCol().model,
          url: this.ServerURLCards
        });

        this.cardCol(new NewCollection(arr));
      }
    });
  };

  selectedBoardChanged = (
    event: ojListView.selectedChanged<Board["id"], Board>) => {

    // Persistencia de contexto de board para navegar a la vista de cards.
    const selected = event.detail.value as KeySetImpl<number | string>;
    const keys = Array.from(selected.values());
    const id = Number(keys[0]);
    const m = this.boardCol().get(id);
    if (!m) return;

    sessionStorage.setItem("boardId", String(m.get("id")));
    sessionStorage.setItem("boardName", m.get("name"));

    window.location.href = "http://localhost:8000/?ojr=boards";
  };

  logout = () => {
    // Cierre de sesion desde modulo boardsList.
    sessionStorage.clear();
    window.location.href = "http://localhost:8000";
  };

  // Hooks de ciclo de vida OJ (reservados para ampliaciones).
  connected() {}
  disconnected() {}
  transitionCompleted() {}
}

export = BoardsListViewModel;