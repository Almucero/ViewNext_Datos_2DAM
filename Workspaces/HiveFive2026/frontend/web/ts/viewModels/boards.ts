/**
 * Archivo: ts/viewModels/boards.ts
 * Proposito: Define logica de UI, estado observable, validaciones y llamadas async de este modulo.
 * Nota: Los comentarios priorizan flujo, side-effects y decisiones de integracion.
 */
import "ojs/ojavatar";
import { ojButtonEventMap } from "ojs/ojbutton";
import { IntlConverterUtils } from "ojs/ojconverterutils-i18n";
import "ojs/ojdialog";
import { ojDialog } from "ojs/ojdialog";
import "ojs/ojdatetimepicker";
import "ojs/ojformlayout";
import "ojs/ojinputtext";
import { KeySetImpl } from "ojs/ojkeyset";
import { ObservableKeySet } from "ojs/ojknockout-keyset";
import "ojs/ojlistview";
import { ojListView } from "ojs/ojlistview";
import { Collection, Model } from "ojs/ojmodel";
import "ojs/ojselectcombobox";
import "ojs/ojselectsingle";
import ko = require("knockout");
import CollectionDataProvider = require("ojs/ojcollectiondataprovider");
import ArrayDataProvider = require("ojs/ojarraydataprovider");
import {
  hasCardChanges,
  hasEmptyRequiredCardFields,
  isCardPriorityValid,
  isCardDateRangeValid,
  type EditableCard,
} from "./boards.validation";

declare const require: any;

type Board = {
  id: number;
  name: string;
};

type Status = {
  id: number;
  name: string;
};

type Role = {
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

type Card = {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  priority: number;
  board_id: number;
  status_id: number;
  user_id: number;
  status: Status;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
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
class BoardsViewModel {
  userID: string;
  boardID: number;
  boardName: string;

  initials: string | undefined;

  ServerURLCards = "http://localhost:8080/api/v1/cards/get-all";

  user: ko.Observable<User>;

  isLoadingCards: ko.Observable<boolean> = ko.observable(true);

  // Observables para los Card
  card: ko.Observable<Card>;
  cardCol: ko.Observable = ko.observable();
  cardSource: ko.Observable = ko.observable();
  cardColTodo: ko.Observable = ko.observable();
  cardSourceTodo: ko.Observable = ko.observable(
    new CollectionDataProvider(new Collection())
  );
  cardColDoing: ko.Observable = ko.observable();
  cardSourceDoing: ko.Observable = ko.observable(
    new CollectionDataProvider(new Collection())
  );
  cardColBlocked: ko.Observable = ko.observable();
  cardSourceBlocked: ko.Observable = ko.observable(
    new CollectionDataProvider(new Collection())
  );
  cardColDone: ko.Observable = ko.observable();
  cardSourceDone: ko.Observable = ko.observable(
    new CollectionDataProvider(new Collection())
  );

  cardSelected: ko.Observable;
  userSelected = ko.observable(false);
  demoComponentReady = ko.observable(false);
  statusDP: ArrayDataProvider<string, { value: string; label: string }>;
  statusValue = ko.observable<string>("2");
  createStatusDP: ArrayDataProvider<string, { value: string; label: string }>;
  createStatusValue = ko.observable<string>("2");
  selectedItemTodo: ObservableKeySet<Card>;
  selectedItemDoing: ObservableKeySet<Card>;
  selectedItemBlocked: ObservableKeySet<Card>;
  selectedItemDone: ObservableKeySet<Card>;
  originalCardForEdit: EditableCard | null = null;
  skeletonTodoRows = ko.observableArray<number>([]);
  skeletonDoingRows = ko.observableArray<number>([]);
  skeletonBlockedRows = ko.observableArray<number>([]);
  skeletonDoneRows = ko.observableArray<number>([]);

  private parseSaveCard = (response: Card) => {
    return {
      ...response,
    };
  };

  private parseCard = (response: Card) => {
    const rawCard = response as any;
    const statusId = Number(
      rawCard.status_id ?? rawCard.statusId ?? rawCard.status?.id ?? 2
    );
    const userId = Number(
      rawCard.user_id ?? rawCard.userId ?? rawCard.user?.id ?? 0
    );

    const statusNameById: { [key: number]: string } = {
      2: "todo",
      3: "doing",
      4: "blocked",
      5: "done",
    };

    const normalizedStatus = rawCard.status ?? {
      id: statusId,
      name: statusNameById[statusId] ?? "todo",
    };

    const normalizedUser = rawCard.user ?? {
      id: userId,
      firstName: "",
      lastName: "",
      email: "",
    };

    return {
      ...rawCard,
      id: Number(rawCard.id ?? 0),
      title: rawCard.title ?? "",
      description: rawCard.description ?? "",
      startDate: rawCard.startDate ?? rawCard.start_date ?? "",
      endDate: rawCard.endDate ?? rawCard.end_date ?? "",
      priority: Number(rawCard.priority ?? 1),
      board_id: Number(
        rawCard.board_id ?? rawCard.boardId ?? rawCard.board?.id ?? 0
      ),
      status_id: statusId,
      user_id: userId,
      status: normalizedStatus,
      user: normalizedUser,
    };
  };

  private resolveCurrentUserId = (): number => {
    return Number(this.user()?.userId ?? this.userID ?? 0);
  };

  private dragItemId;
  private readonly skeletonCountsStoragePrefix = "boards-skeleton-counts";

  private userCol: ko.Observable = ko.observable();
  userDatasourse: ko.Observable = ko.observable();

  t = (key: string): string => {
    const i18n = (window as any).hiveI18n;
    return i18n && typeof i18n.t === "function" ? i18n.t(key) : key;
  };

  private translate = (key: string, fallback: string): string => {
    const translated = this.t(key);
    return translated === key ? fallback : translated;
  };

  private buildStatusOptions = (): Array<{ value: string; label: string }> => {
    return [
      { value: "2", label: this.translate("cards.statusTodo", "To do") },
      { value: "3", label: this.translate("cards.statusDoing", "Doing") },
      { value: "4", label: this.translate("cards.statusBlocked", "Blocked") },
      { value: "5", label: this.translate("cards.statusDone", "Done") },
    ];
  };
  // Inicializa observables, adapta datos de sesion y dispara cargas iniciales.
  constructor() {
    // this.loadDemoComponentSafely();

    const ssUser = sessionStorage.getItem("user");
    const ssBoard = sessionStorage.getItem("boardId");
    const nameBoard = sessionStorage.getItem("boardName");

    const jsonObject = JSON.parse(ssUser as string);
    this.userID = jsonObject.userId;
    this.boardID = Number(ssBoard);
    this.boardName = nameBoard as string;

    this.user = ko.observable({
      userId: jsonObject.userId,
      email: jsonObject.email,
      firstName: jsonObject.firstName,
      lastName: jsonObject.lastName,
      password: jsonObject.password,
      role: {
        id: jsonObject.roleId,
        name: jsonObject.roleName,
      },
      boards: jsonObject.boards,
    });

    this.statusDP = new ArrayDataProvider(this.buildStatusOptions(), {
      keyAttributes: "value",
    });
    this.createStatusDP = new ArrayDataProvider(this.buildStatusOptions(), {
      keyAttributes: "value",
    });

    this.card = ko.observable<Card>({
      id: 0,
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      priority: 1,
      board_id: this.boardID,
      status_id: 2,
      user_id: Number(this.userID),
      status: {
        id: 2,
        name: "todo",
      },
      user: {
        id: Number(this.userID),
        firstName: this.user().firstName,
        lastName: this.user().lastName,
        email: this.user().email,
      },
    });

    const cardColAux = this.createCollectionCards();
    this.cardCol(cardColAux);
    this.cardSource(new CollectionDataProvider(this.cardCol()));

    this.cardColTodo(this.createCollectionCards());
    this.cardSourceTodo(new CollectionDataProvider(this.cardColTodo()));
    this.cardColDoing(this.createCollectionCards());
    this.cardSourceDoing(new CollectionDataProvider(this.cardColDoing()));
    this.cardColBlocked(this.createCollectionCards());
    this.cardSourceBlocked(new CollectionDataProvider(this.cardColBlocked()));
    this.cardColDone(this.createCollectionCards());
    this.cardSourceDone(new CollectionDataProvider(this.cardColDone()));

    this.cardFilter();

    this.cardSelected = ko.observable();
    this.selectedItemTodo = new ObservableKeySet(new KeySetImpl());
    this.selectedItemDoing = new ObservableKeySet(new KeySetImpl());
    this.selectedItemBlocked = new ObservableKeySet(new KeySetImpl());
    this.selectedItemDone = new ObservableKeySet(new KeySetImpl());

    this.dragItemId = 0;

    this.initials = IntlConverterUtils.getInitials(
      this.user().firstName,
      this.user().lastName
    );

    this.userCol(this.createCollectionUser());
    this.userCol()
      .fetch()
      .then(() => {
        this.getUser();
      })
      .catch((error: Error) => {
        console.error("Error loading the collection:", error);
      });

    this.userDatasourse(new CollectionDataProvider(this.userCol()));
    this.loadSkeletonRowsFromStorage();
  }

  private buildSkeletonRows = (count: number): number[] => {
    const safeCount = Math.max(0, Number.isFinite(count) ? Math.floor(count) : 0);
    return Array.from({ length: safeCount }, (_, idx) => idx);
  };

  private getSkeletonStorageKey = (): string => {
    return `${this.skeletonCountsStoragePrefix}:${this.userID}:${this.boardID}`;
  };

  private loadSkeletonRowsFromStorage = (): void => {
    const defaultCounts = { todo: 3, doing: 2, blocked: 1, done: 4 };

    try {
      const savedRaw = localStorage.getItem(this.getSkeletonStorageKey());
      const saved = savedRaw ? JSON.parse(savedRaw) : defaultCounts;

      this.skeletonTodoRows(this.buildSkeletonRows(Number(saved?.todo ?? defaultCounts.todo)));
      this.skeletonDoingRows(this.buildSkeletonRows(Number(saved?.doing ?? defaultCounts.doing)));
      this.skeletonBlockedRows(
        this.buildSkeletonRows(Number(saved?.blocked ?? defaultCounts.blocked))
      );
      this.skeletonDoneRows(this.buildSkeletonRows(Number(saved?.done ?? defaultCounts.done)));
    } catch (error) {
      this.skeletonTodoRows(this.buildSkeletonRows(defaultCounts.todo));
      this.skeletonDoingRows(this.buildSkeletonRows(defaultCounts.doing));
      this.skeletonBlockedRows(this.buildSkeletonRows(defaultCounts.blocked));
      this.skeletonDoneRows(this.buildSkeletonRows(defaultCounts.done));
    }
  };

  private persistSkeletonCounts = (
    todoCount: number,
    doingCount: number,
    blockedCount: number,
    doneCount: number
  ): void => {
    try {
      localStorage.setItem(
        this.getSkeletonStorageKey(),
        JSON.stringify({
          todo: Math.max(0, todoCount),
          doing: Math.max(0, doingCount),
          blocked: Math.max(0, blockedCount),
          done: Math.max(0, doneCount),
        })
      );
    } catch (error) {
    }
  };

  private loadDemoComponentSafely = () => {
    require(
      ["demo-component/loader"],
      () => {
        this.demoComponentReady(true);
      },
      (error: any) => {
        this.demoComponentReady(false);
        console.error("Could not load demo-component/loader", error);
      }
    );
  };

  onStatusValueChanged = (event: any) => {
    const statusId = Number(event?.detail?.value ?? this.statusValue());
    const namesById: { [key: number]: string } = {
      2: "todo",
      3: "doing",
      4: "blocked",
      5: "done",
    };

    this.statusValue(String(statusId));
    this.card().status_id = statusId;
    this.card().status = {
      id: statusId,
      name: namesById[statusId] ?? "todo",
    };
  };

  handleStart = (event: any, context?: any) => {
    const candidateFromContext =
      context?.items?.[0]?.data?.id ??
      context?.items?.[0]?.metadata?.key ??
      event?.detail?.items?.[0]?.data?.id ??
      event?.detail?.items?.[0]?.metadata?.key;

    if (candidateFromContext !== undefined && candidateFromContext !== null) {
      this.dragItemId = Number(candidateFromContext);
      return;
    }

    if (event?.dataTransfer) {
      const payloads = [
        event.dataTransfer.getData("application/ojlistviewitems+json"),
        event.dataTransfer.getData("application/json"),
        event.dataTransfer.getData("text/plain"),
      ].filter((payload: string) => !!payload);

      for (const payload of payloads) {
        try {
          const parsed = JSON.parse(payload);
          const candidateId = Array.isArray(parsed)
            ? parsed?.[0]?.id
            : parsed?.id ?? parsed?.data?.id;

          if (candidateId !== undefined && candidateId !== null) {
            this.dragItemId = Number(candidateId);
            return;
          }
        } catch (error) {
        }
      }
    }

    const selectedId = this.cardSelected()?.id;
    if (selectedId !== undefined && selectedId !== null) {
      this.dragItemId = Number(selectedId);
    }
  };

  handleEnd = (event: DragEvent) => {
    if (
      event.dataTransfer !== null &&
      event.dataTransfer.dropEffect !== "none"
    ) {
      this._removeSourceItem();
    }
  };

  handleDrop = (
    listId: string,
    event: DragEvent,
    context: ojListView.ItemsDropContext
  ) => {
    event.preventDefault();
    let index = -1;
    if (context.item) {
      const itemContext = (
        document.getElementById(listId) as ojListView<Board["id"], Board>
      ).getContextByNode(context.item);
      if (itemContext !== null) {
        index = itemContext.index;
        if (context.position === "after") {
          index += 1;
        }
      }
    }
    this._handleDataTransfer(event.dataTransfer, index, listId);
  };

  private _handleDataTransfer = (
    dataTransfer: any,
    index: number,
    listId: string
  ) => {
    let data: any = null;

    if (dataTransfer) {
      const payloads = [
        dataTransfer.getData("application/ojlistviewitems+json"),
        dataTransfer.getData("application/json"),
        dataTransfer.getData("text/plain"),
      ].filter((payload: string) => !!payload);

      for (const payload of payloads) {
        try {
          const parsedData = JSON.parse(payload);
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            data = parsedData[0];
            break;
          }

          if (!Array.isArray(parsedData) && parsedData) {
            data = parsedData.data ?? parsedData;
            break;
          }
        } catch (error) {
        }
      }
    }

    if (!data && this.dragItemId) {
      const draggedModel = this.cardCol().get(this.dragItemId);
      if (draggedModel) {
        data = draggedModel.toJSON();
      }
    }

    if (!data) {
      console.warn("Could not resolve the dragged card");
      return;
    }
    this._insertTargetItem(data, index, listId);
  };

  private _insertTargetItem = (data: any, index: number, listId: string) => {
    const arr = this.cardCol();

    if (!data.status) {
      data.status = { id: 2, name: "todo" };
    }

    if (listId === "activitiesList1") {
      data.status.id = 2;
      data.status.name = "todo";
      data.status_id = 2;
    } else if (listId === "activitiesList2") {
      data.status.id = 3;
      data.status.name = "doing";
      data.status_id = 3;
    } else if (listId === "activitiesList3") {
      data.status.id = 4;
      data.status.name = "blocked";
      data.status_id = 4;
    } else if (listId === "activitiesList4") {
      data.status.id = 5;
      data.status.name = "done";
      data.status_id = 5;
    }

    this.card(data);
    this.cardSelected(data);
    this.userSelected(true);
    this.updateCard();
  };

  private _removeSourceItem = () => {
    this.cardCol.valueHasMutated();
  };

  private getLocalMaxCardId = (): number => {
    const collection = this.cardCol();
    if (!collection || !collection.models || collection.models.length === 0) {
      return 0;
    }

    const ids = collection.models
      .map((model: Model) => {
        const asAny = model as any;
        return Number(
          model.get("id") ??
            asAny?.attributes?.id ??
            asAny?.attributes?.card_id ??
            0
        );
      })
      .filter((id: number) => !Number.isNaN(id) && id > 0);

    return ids.length === 0 ? 0 : Math.max(...ids);
  };

  private getNextCardId = async (): Promise<number> => {
    const localMaxId = this.getLocalMaxCardId();

    try {
      const response = await fetch(this.ServerURLCards, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json().catch(() => null);
      const rawCards = Array.isArray(data)
        ? data
        : Array.isArray(data?.Card)
          ? data.Card
          : Array.isArray(data?.cards)
            ? data.cards
            : [];

      const remoteIds = rawCards
        .map((card: any) => Number(card?.id ?? card?.card_id ?? card?.cardId ?? 0))
        .filter((id: number) => !Number.isNaN(id) && id > 0);

      const remoteMaxId = remoteIds.length === 0 ? 0 : Math.max(...remoteIds);
      return Math.max(localMaxId, remoteMaxId) + 1;
    } catch (error) {
      console.warn("Could not calculate the remote card id, using local fallback", error);
      return localMaxId + 1;
    }
  };

  public inicializar = async () => {
    const nextCardId = await this.getNextCardId();
    this.card({
      id: nextCardId,
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      priority: 1,
      board_id: this.boardID,
      status_id: 2,
      user_id: Number(this.userID),
      status: {
        id: 2,
        name: "todo",
      },
      user: {
        id: Number(this.userID),
        firstName: this.user().firstName,
        lastName: this.user().lastName,
        email: this.user().email,
      },
    });
  };

  public cardFilter = () => {
    this.isLoadingCards(true);

    // Timeout to force loading to stop after 1 second, regardless of fetch result
    const timeoutId = setTimeout(() => {
      this.isLoadingCards(false);
    }, 1000);

    this.cardCol().fetch({
      success: (collection: Collection) => {
        clearTimeout(timeoutId);
        const createFilteredCollection = (filteredData: Card[]) => {
          const modelArray = filteredData.map(
            (card) => new (this.cardCol().model)(card)
          );
          return new (Collection.extend({
            model: this.cardCol().model,
            url: this.ServerURLCards,
          }))(modelArray);
        };

        const data = collection.toJSON() as Card[];

        const board = data.filter((card) => card.board_id == this.boardID);

        this.cardCol(createFilteredCollection(board));

        this.cardSource(new CollectionDataProvider(this.cardCol()));
        const todo = board.filter((card) => Number(card.status_id) === 2);
        const doing = board.filter((card) => Number(card.status_id) === 3);
        const blocked = board.filter((card) => Number(card.status_id) === 4);
        const done = board.filter((card) => Number(card.status_id) === 5);
        const rejected = board.filter((card) => Number(card.status_id) === 6);

        this.skeletonTodoRows(this.buildSkeletonRows(todo.length));
        this.skeletonDoingRows(this.buildSkeletonRows(doing.length));
        this.skeletonBlockedRows(this.buildSkeletonRows(blocked.length));
        this.skeletonDoneRows(this.buildSkeletonRows(done.length));
        this.persistSkeletonCounts(todo.length, doing.length, blocked.length, done.length);

        this.cardColTodo(createFilteredCollection(todo));
        this.cardColDoing(createFilteredCollection(doing));
        this.cardColBlocked(createFilteredCollection(blocked));
        this.cardColDone(createFilteredCollection(done));

        // Actualiza los Source con las colecciones ya filtradas
        this.cardSourceTodo(new CollectionDataProvider(this.cardColTodo()));
        this.cardSourceDoing(new CollectionDataProvider(this.cardColDoing()));
        this.cardSourceBlocked(
          new CollectionDataProvider(this.cardColBlocked())
        );
        this.cardSourceDone(new CollectionDataProvider(this.cardColDone()));

        this.isLoadingCards(false);
      },
      error: (collection: Collection, error: any) => {
        // Don't clear timeout here - let it handle setting isLoadingCards to false
        // clearTimeout(timeoutId);
      },
    });
  };


  isCardSourceEmpty = (statusID: number) => {
    switch (statusID) {
      case 1:
        return this.cardSourceTodo().isEmpty();
      case 2:
        return this.cardSourceDoing().isEmpty();
      case 3:
        return this.cardSourceBlocked().isEmpty();
      case 4:
        return this.cardSourceDone().isEmpty();
    }
  };

  public createCollectionCards = () => {
    let MyCardCollection = Collection.extend({
      url: this.ServerURLCards,
      model: Model.extend({
        urlRoot: this.ServerURLCards,
        parse: this.parseCard,
        parseSave: this.parseSaveCard,
        idAttribute: "id",
      }),
      comparator: "id",
    });
    return new MyCardCollection();
  };

  public createCollectionUser = () => {
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
    const collection = this.userCol();
    if (!collection) return;
  
    const model = collection.get(this.userID);
  
    if (!model) {
      console.warn("⚠️ User not found in userCol. userID =", this.userID);
      return;
    }
  
    const boardsData = model.get("boards");
    const boards = boardsData?.board?.map((b: any) => ({ id: b.id, name: b.name })) || [];
  
    const userAux = {
      userId: Number(model.get("userId") ?? model.get("id") ?? this.userID),
      email: model.get("email"),
      firstName: model.get("firstName"),
      lastName: model.get("lastName"),
      password: model.get("password"),
      role: model.get("role") || { id: 0, name: "" },
      boards: { board: boards }
    };
  
    this.user(userAux);
  };

  public computeInitials = (fn: string, ln: string) => {
    return IntlConverterUtils.getInitials(fn, ln);
  };

  public showCreateDialog = async (event: ojButtonEventMap["ojAction"]) => {
    if (this.card().title != "") {
      await this.inicializar();
    }
    this.createStatusValue("2");
    (document.getElementById("createDialog") as ojDialog).open();
  };

  public showEditDialog = (event: ojButtonEventMap["ojAction"]) => {
    if (!this.cardSelected()) {
      return;
    }
    const selected = this.cardSelected();
    const clonedCard = {
      ...selected,
      status: { ...(selected.status || { id: 2, name: "todo" }) },
      user: { ...(selected.user || { id: Number(this.userID), firstName: "", lastName: "", email: "" }) },
    };

    this.card(clonedCard);
    this.originalCardForEdit = {
      title: clonedCard.title,
      description: clonedCard.description,
      startDate: clonedCard.startDate,
      endDate: clonedCard.endDate,
      priority: clonedCard.priority,
      status_id: clonedCard.status_id,
    };
    this.statusValue(String(this.card().status_id ?? this.card().status?.id ?? 2));
    (document.getElementById("editDialog") as ojDialog).open();
  };

  // Crear Tarjeta
  // Operacion de escritura: valida entrada, invoca API y actualiza colecciones locales.
createCard = async () => {
    const editable: EditableCard = {
      title: this.card().title,
      description: this.card().description,
      startDate: this.card().startDate,
      endDate: this.card().endDate,
      priority: this.card().priority,
      status_id: Number(this.createStatusValue()),
    };

    if (hasEmptyRequiredCardFields(editable)) {
      showLogAlert(this.t("cards.alertRequired"), "#f44336");
      return;
    }

    if (!isCardPriorityValid(editable.priority)) {
      showLogAlert(this.t("cards.alertPriority"), "#f44336");
      return;
    }

    if (!isCardDateRangeValid(editable.startDate, editable.endDate)) {
      showLogAlert(this.t("cards.alertDates"), "#f44336");
      return;
    }

    const resolvedUserId = this.resolveCurrentUserId();
    if (!resolvedUserId || Number.isNaN(resolvedUserId)) {
      showLogAlert(this.t("cards.alertResolveUser"), "#f44336");
      return;
    }

    const payload = {
      Card: [
        {
          id: await this.getNextCardId(),
          title: this.card().title.trim(),
          description: this.card().description.trim(),
          startDate: this.card().startDate,
          endDate: this.card().endDate,
          priority: Number(this.card().priority),
          boardId: Number(this.boardID),
          statusId: Number(this.createStatusValue()),
          userId: resolvedUserId,
        }
      ]
    };

    try {
      const response = await fetch("http://localhost:8080/api/v1/cards/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const rawResponse = await response.text();
      let createdCard: any = null;
      if (rawResponse) {
        try {
          createdCard = JSON.parse(rawResponse);
        } catch {
          createdCard = rawResponse;
        }
      }
      this.cardFilter();
      showLogAlert(this.t("cards.alertCreated"), "#1D4355");
      (document.getElementById("createDialog") as ojDialog).close();
    } catch (error) {
      console.error("Failed to create card:", error);
      showLogAlert(this.t("cards.alertCreateError"), "#f44336");
    }
  };

  // Eliminar Tarjeta
  // Operacion de escritura: valida entrada, invoca API y actualiza colecciones locales.
deleteCard = async () => {
    const cardId = this.card().id;
    if (!cardId) {
      showLogAlert(this.t("cards.alertSelectDelete"), "#f44336");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/cards/delete/${cardId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      this.cardFilter();
      showLogAlert(this.t("cards.alertDeleted"), "#1D4355");
      (document.getElementById("editDialog") as ojDialog).close();
    } catch (error) {
      console.error("Failed to delete card:", error);
      showLogAlert(this.t("cards.alertDeleteError"), "#f44336");
    }
  };

  // Actualizar Tarjeta
  // Operacion de escritura: valida entrada, invoca API y actualiza colecciones locales.
updateCard = async () => {
    const selectedCard = this.cardSelected();
    if (!selectedCard) {
      showLogAlert(this.t("cards.alertSelectUpdate"), "#f44336");
      return;
    }

    const editDialog = document.getElementById("editDialog");
    const componentValue = (selector: string, index: number): unknown => {
      if (!editDialog) {
        return undefined;
      }

      const components = editDialog.querySelectorAll(selector);
      const element = components[index] as (HTMLElement & { value?: unknown }) | undefined;
      return element?.value;
    };
    const pickStringValue = (valueFromDialog: unknown, fallback: string): string => {
      return valueFromDialog === undefined || valueFromDialog === null
        ? fallback
        : String(valueFromDialog);
    };

    const pickPriorityValue = (valueFromDialog: unknown, fallback: number): number | string => {
      if (valueFromDialog === undefined || valueFromDialog === null) {
        return fallback;
      }
      if (typeof valueFromDialog === "number") {
        return valueFromDialog;
      }
      return String(valueFromDialog).trim();
    };
    const titleFromDialog = componentValue("oj-input-text", 0);
    const descriptionFromDialog = componentValue("oj-input-text", 1);
    const priorityFromDialog = componentValue("oj-input-text", 2);
    const startDateFromDialog = componentValue("oj-input-date", 0);
    const endDateFromDialog = componentValue("oj-input-date", 1);

    const currentEditable: EditableCard = {
      title: pickStringValue(titleFromDialog, this.card().title),
      description: pickStringValue(descriptionFromDialog, this.card().description),
      startDate: pickStringValue(startDateFromDialog, this.card().startDate),
      endDate: pickStringValue(endDateFromDialog, this.card().endDate),
      priority: pickPriorityValue(priorityFromDialog, this.card().priority),
      status_id: this.card().status_id,
    };

   
    if (this.originalCardForEdit) {
      if (hasEmptyRequiredCardFields(currentEditable) ) {
        showLogAlert(this.t("cards.alertRequired"), "#f44336");
        return;
      }

      if (!isCardPriorityValid(currentEditable.priority)) {
        showLogAlert(this.t("cards.alertPriority"), "#f44336");
        return;
      }

      if (!isCardDateRangeValid(currentEditable.startDate, currentEditable.endDate)) {
        showLogAlert(this.t("cards.alertDates"), "#f44336");
        return;
      }

      if (!this.originalCardForEdit || !hasCardChanges(this.originalCardForEdit, currentEditable)) {
        showLogAlert(this.t("cards.alertNoChanges"), "#f44336");
        return;
      }
    }

    const row = {
      Card: [
        {
          id: this.card().id,
          boardId: this.boardID,
          endDate: this.card().endDate,
          priority: this.card().priority,
          startDate: this.card().startDate,
          statusId: this.card().status_id,
          userId: this.resolveCurrentUserId(),
          description: this.card().description,
          title: this.card().title,
        },
      ],
    };

    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/cards/update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(row),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      await response.json().catch(() => null);
      this.originalCardForEdit = {
        ...currentEditable,
      };
      this.cardFilter();
      showLogAlert(this.t("cards.alertUpdated"), "#1D4355");
      (document.getElementById("editDialog") as ojDialog).close();
    } catch (error) {
      console.error("Failed to update card:", error);
      showLogAlert(this.t("cards.alertUpdateError"), "#f44336");
    }
  };

  selectedItemChangedTodo = async (
    event: ojListView.selectedChanged<Card["id"], Card>
  ) => {
    if (event.detail.updatedFrom === "internal") {
      const selectedCardId = event.detail.value;
      const keys = (selectedCardId as KeySetImpl<Card["id"]>).keys
        .keys as Set<number>; 
      const selectedCard = await this.cardSourceTodo().fetchByKeys({ keys }); // Extraer del Provider las tarjetas con el id de las claves
      this.cardSelected({
        ...selectedCard.results.get(Array.from(keys.values())[0]).data,
      });
      this.selectedItemDoing.clear();
      this.selectedItemBlocked.clear();
      this.selectedItemDone.clear();
      this.userSelected(true);
    }
  };

  selectedItemChangedDoing = async (
    event: ojListView.selectedChanged<Card["id"], Card>
  ) => {
    if (event.detail.updatedFrom === "internal") {
      const selectedCardId = event.detail.value; // Nos devuelve un KeySet de los id de las tarjetas seleccionada
      const keys = (selectedCardId as KeySetImpl<Card["id"]>).keys
        .keys as Set<number>; // Conseguir la clave en conjunto de tipo Set
      const selectedCard = await this.cardSourceDoing().fetchByKeys({ keys }); // Extraer del Provider las tarjetas con el id de las claves
      this.cardSelected({
        ...selectedCard.results.get(Array.from(keys.values())[0]).data,
      });
      this.selectedItemTodo.clear();
      this.selectedItemBlocked.clear();
      this.selectedItemDone.clear();
      this.userSelected(true);
    }
  };

  selectedItemChangedBlocked = async (
    event: ojListView.selectedChanged<Card["id"], Card>
  ) => {
    if (event.detail.updatedFrom === "internal") {
      const selectedCardId = event.detail.value; // Nos devuelve un KeySet de los id de las tarjetas seleccionada
      const keys = (selectedCardId as KeySetImpl<Card["id"]>).keys
        .keys as Set<number>; // Conseguir la clave en conjunto de tipo Set
      const selectedCard = await this.cardSourceBlocked().fetchByKeys({ keys }); // Extraer del Provider las tarjetas con el id de las claves
      this.cardSelected({
        ...selectedCard.results.get(Array.from(keys.values())[0]).data,
      });
      this.selectedItemTodo.clear();
      this.selectedItemDoing.clear();
      this.selectedItemDone.clear();
      this.userSelected(true);
    }
  };

  selectedItemChangedDone = async (
    event: ojListView.selectedChanged<Card["id"], Card>
  ) => {
    if (event.detail.updatedFrom === "internal") {
      const selectedCardId = event.detail.value; // Nos devuelve un KeySet de los id de las tarjetas seleccionada
      const keys = (selectedCardId as KeySetImpl<Card["id"]>).keys
        .keys as Set<number>; // Conseguir la clave en conjunto de tipo Set
      const selectedCard = await this.cardSourceDone().fetchByKeys({ keys }); // Extraer del Provider las tarjetas con el id de las claves
      // Almacenarlo en el observable
      this.cardSelected({
        ...selectedCard.results.get(Array.from(keys.values())[0]).data,
      });
      this.selectedItemTodo.clear();
      this.selectedItemDoing.clear();
      this.selectedItemBlocked.clear();
      this.userSelected(true);
    }
  };

  isUserInBoard = (boardList: Board[]) => {
    let res: boolean = false;
    boardList.forEach((board) => {
      if (board.id == this.boardID) {
        res = true;
      }
    });

    return res;
  };

  logout = () => {
    sessionStorage.clear();
    window.location.href = "http://localhost:8080";
  };

  connected(): void {
  }

  disconnected(): void {

  }

  transitionCompleted(): void {
  }
}

export = BoardsViewModel;
