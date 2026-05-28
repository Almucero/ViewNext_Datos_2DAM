var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "ojs/ojconverterutils-i18n", "ojs/ojkeyset", "ojs/ojknockout-keyset", "ojs/ojmodel", "knockout", "ojs/ojcollectiondataprovider", "ojs/ojarraydataprovider", "./boards.validation", "ojs/ojavatar", "ojs/ojdialog", "ojs/ojdatetimepicker", "ojs/ojformlayout", "ojs/ojinputtext", "ojs/ojlistview", "ojs/ojselectcombobox", "ojs/ojselectsingle"], function (require, exports, ojconverterutils_i18n_1, ojkeyset_1, ojknockout_keyset_1, ojmodel_1, ko, CollectionDataProvider, ArrayDataProvider, boards_validation_1) {
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
    class BoardsViewModel {
        constructor() {
            this.ServerURLCards = "http://localhost:8080/api/v1/cards/get-all";
            this.isLoadingCards = ko.observable(true);
            this.cardCol = ko.observable();
            this.cardSource = ko.observable();
            this.cardColTodo = ko.observable();
            this.cardSourceTodo = ko.observable(new CollectionDataProvider(new ojmodel_1.Collection()));
            this.cardColDoing = ko.observable();
            this.cardSourceDoing = ko.observable(new CollectionDataProvider(new ojmodel_1.Collection()));
            this.cardColBlocked = ko.observable();
            this.cardSourceBlocked = ko.observable(new CollectionDataProvider(new ojmodel_1.Collection()));
            this.cardColDone = ko.observable();
            this.cardSourceDone = ko.observable(new CollectionDataProvider(new ojmodel_1.Collection()));
            this.userSelected = ko.observable(false);
            this.demoComponentReady = ko.observable(false);
            this.statusValue = ko.observable("2");
            this.createStatusValue = ko.observable("2");
            this.originalCardForEdit = null;
            this.skeletonTodoRows = ko.observableArray([]);
            this.skeletonDoingRows = ko.observableArray([]);
            this.skeletonBlockedRows = ko.observableArray([]);
            this.skeletonDoneRows = ko.observableArray([]);
            this.parseSaveCard = (response) => {
                return Object.assign({}, response);
            };
            this.parseCard = (response) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
                const rawCard = response;
                const statusId = Number((_d = (_b = (_a = rawCard.status_id) !== null && _a !== void 0 ? _a : rawCard.statusId) !== null && _b !== void 0 ? _b : (_c = rawCard.status) === null || _c === void 0 ? void 0 : _c.id) !== null && _d !== void 0 ? _d : 2);
                const userId = Number((_h = (_f = (_e = rawCard.user_id) !== null && _e !== void 0 ? _e : rawCard.userId) !== null && _f !== void 0 ? _f : (_g = rawCard.user) === null || _g === void 0 ? void 0 : _g.id) !== null && _h !== void 0 ? _h : 0);
                const statusNameById = {
                    2: "todo",
                    3: "doing",
                    4: "blocked",
                    5: "done",
                };
                const normalizedStatus = (_j = rawCard.status) !== null && _j !== void 0 ? _j : {
                    id: statusId,
                    name: (_k = statusNameById[statusId]) !== null && _k !== void 0 ? _k : "todo",
                };
                const normalizedUser = (_l = rawCard.user) !== null && _l !== void 0 ? _l : {
                    id: userId,
                    firstName: "",
                    lastName: "",
                    email: "",
                };
                return Object.assign(Object.assign({}, rawCard), { id: Number((_m = rawCard.id) !== null && _m !== void 0 ? _m : 0), title: (_o = rawCard.title) !== null && _o !== void 0 ? _o : "", description: (_p = rawCard.description) !== null && _p !== void 0 ? _p : "", startDate: (_r = (_q = rawCard.startDate) !== null && _q !== void 0 ? _q : rawCard.start_date) !== null && _r !== void 0 ? _r : "", endDate: (_t = (_s = rawCard.endDate) !== null && _s !== void 0 ? _s : rawCard.end_date) !== null && _t !== void 0 ? _t : "", priority: Number((_u = rawCard.priority) !== null && _u !== void 0 ? _u : 1), board_id: Number((_y = (_w = (_v = rawCard.board_id) !== null && _v !== void 0 ? _v : rawCard.boardId) !== null && _w !== void 0 ? _w : (_x = rawCard.board) === null || _x === void 0 ? void 0 : _x.id) !== null && _y !== void 0 ? _y : 0), status_id: statusId, user_id: userId, status: normalizedStatus, user: normalizedUser });
            };
            this.resolveCurrentUserId = () => {
                var _a, _b, _c;
                return Number((_c = (_b = (_a = this.user()) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : this.userID) !== null && _c !== void 0 ? _c : 0);
            };
            this.skeletonCountsStoragePrefix = "boards-skeleton-counts";
            this.userCol = ko.observable();
            this.userDatasourse = ko.observable();
            this.t = (key) => {
                const i18n = window.hiveI18n;
                return i18n && typeof i18n.t === "function" ? i18n.t(key) : key;
            };
            this.translate = (key, fallback) => {
                const translated = this.t(key);
                return translated === key ? fallback : translated;
            };
            this.buildStatusOptions = () => {
                return [
                    { value: "2", label: this.translate("cards.statusTodo", "To do") },
                    { value: "3", label: this.translate("cards.statusDoing", "Doing") },
                    { value: "4", label: this.translate("cards.statusBlocked", "Blocked") },
                    { value: "5", label: this.translate("cards.statusDone", "Done") },
                ];
            };
            this.buildSkeletonRows = (count) => {
                const safeCount = Math.max(0, Number.isFinite(count) ? Math.floor(count) : 0);
                return Array.from({ length: safeCount }, (_, idx) => idx);
            };
            this.getSkeletonStorageKey = () => {
                return `${this.skeletonCountsStoragePrefix}:${this.userID}:${this.boardID}`;
            };
            this.loadSkeletonRowsFromStorage = () => {
                var _a, _b, _c, _d;
                const defaultCounts = { todo: 3, doing: 2, blocked: 1, done: 4 };
                try {
                    const savedRaw = localStorage.getItem(this.getSkeletonStorageKey());
                    const saved = savedRaw ? JSON.parse(savedRaw) : defaultCounts;
                    this.skeletonTodoRows(this.buildSkeletonRows(Number((_a = saved === null || saved === void 0 ? void 0 : saved.todo) !== null && _a !== void 0 ? _a : defaultCounts.todo)));
                    this.skeletonDoingRows(this.buildSkeletonRows(Number((_b = saved === null || saved === void 0 ? void 0 : saved.doing) !== null && _b !== void 0 ? _b : defaultCounts.doing)));
                    this.skeletonBlockedRows(this.buildSkeletonRows(Number((_c = saved === null || saved === void 0 ? void 0 : saved.blocked) !== null && _c !== void 0 ? _c : defaultCounts.blocked)));
                    this.skeletonDoneRows(this.buildSkeletonRows(Number((_d = saved === null || saved === void 0 ? void 0 : saved.done) !== null && _d !== void 0 ? _d : defaultCounts.done)));
                }
                catch (error) {
                    this.skeletonTodoRows(this.buildSkeletonRows(defaultCounts.todo));
                    this.skeletonDoingRows(this.buildSkeletonRows(defaultCounts.doing));
                    this.skeletonBlockedRows(this.buildSkeletonRows(defaultCounts.blocked));
                    this.skeletonDoneRows(this.buildSkeletonRows(defaultCounts.done));
                }
            };
            this.persistSkeletonCounts = (todoCount, doingCount, blockedCount, doneCount) => {
                try {
                    localStorage.setItem(this.getSkeletonStorageKey(), JSON.stringify({
                        todo: Math.max(0, todoCount),
                        doing: Math.max(0, doingCount),
                        blocked: Math.max(0, blockedCount),
                        done: Math.max(0, doneCount),
                    }));
                }
                catch (error) {
                }
            };
            this.loadDemoComponentSafely = () => {
                require(["demo-component/loader"], () => {
                    this.demoComponentReady(true);
                }, (error) => {
                    this.demoComponentReady(false);
                    console.error("Could not load demo-component/loader", error);
                });
            };
            this.onStatusValueChanged = (event) => {
                var _a, _b, _c;
                const statusId = Number((_b = (_a = event === null || event === void 0 ? void 0 : event.detail) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : this.statusValue());
                const namesById = {
                    2: "todo",
                    3: "doing",
                    4: "blocked",
                    5: "done",
                };
                this.statusValue(String(statusId));
                this.card().status_id = statusId;
                this.card().status = {
                    id: statusId,
                    name: (_c = namesById[statusId]) !== null && _c !== void 0 ? _c : "todo",
                };
            };
            this.handleStart = (event, context) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
                const candidateFromContext = (_o = (_h = (_d = (_c = (_b = (_a = context === null || context === void 0 ? void 0 : context.items) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.id) !== null && _d !== void 0 ? _d : (_g = (_f = (_e = context === null || context === void 0 ? void 0 : context.items) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.metadata) === null || _g === void 0 ? void 0 : _g.key) !== null && _h !== void 0 ? _h : (_m = (_l = (_k = (_j = event === null || event === void 0 ? void 0 : event.detail) === null || _j === void 0 ? void 0 : _j.items) === null || _k === void 0 ? void 0 : _k[0]) === null || _l === void 0 ? void 0 : _l.data) === null || _m === void 0 ? void 0 : _m.id) !== null && _o !== void 0 ? _o : (_s = (_r = (_q = (_p = event === null || event === void 0 ? void 0 : event.detail) === null || _p === void 0 ? void 0 : _p.items) === null || _q === void 0 ? void 0 : _q[0]) === null || _r === void 0 ? void 0 : _r.metadata) === null || _s === void 0 ? void 0 : _s.key;
                if (candidateFromContext !== undefined && candidateFromContext !== null) {
                    this.dragItemId = Number(candidateFromContext);
                    return;
                }
                if (event === null || event === void 0 ? void 0 : event.dataTransfer) {
                    const payloads = [
                        event.dataTransfer.getData("application/ojlistviewitems+json"),
                        event.dataTransfer.getData("application/json"),
                        event.dataTransfer.getData("text/plain"),
                    ].filter((payload) => !!payload);
                    for (const payload of payloads) {
                        try {
                            const parsed = JSON.parse(payload);
                            const candidateId = Array.isArray(parsed)
                                ? (_t = parsed === null || parsed === void 0 ? void 0 : parsed[0]) === null || _t === void 0 ? void 0 : _t.id
                                : (_u = parsed === null || parsed === void 0 ? void 0 : parsed.id) !== null && _u !== void 0 ? _u : (_v = parsed === null || parsed === void 0 ? void 0 : parsed.data) === null || _v === void 0 ? void 0 : _v.id;
                            if (candidateId !== undefined && candidateId !== null) {
                                this.dragItemId = Number(candidateId);
                                return;
                            }
                        }
                        catch (error) {
                        }
                    }
                }
                const selectedId = (_w = this.cardSelected()) === null || _w === void 0 ? void 0 : _w.id;
                if (selectedId !== undefined && selectedId !== null) {
                    this.dragItemId = Number(selectedId);
                }
            };
            this.handleEnd = (event) => {
                if (event.dataTransfer !== null &&
                    event.dataTransfer.dropEffect !== "none") {
                    this._removeSourceItem();
                }
            };
            this.handleDrop = (listId, event, context) => {
                event.preventDefault();
                let index = -1;
                if (context.item) {
                    const itemContext = document.getElementById(listId).getContextByNode(context.item);
                    if (itemContext !== null) {
                        index = itemContext.index;
                        if (context.position === "after") {
                            index += 1;
                        }
                    }
                }
                this._handleDataTransfer(event.dataTransfer, index, listId);
            };
            this._handleDataTransfer = (dataTransfer, index, listId) => {
                var _a;
                let data = null;
                if (dataTransfer) {
                    const payloads = [
                        dataTransfer.getData("application/ojlistviewitems+json"),
                        dataTransfer.getData("application/json"),
                        dataTransfer.getData("text/plain"),
                    ].filter((payload) => !!payload);
                    for (const payload of payloads) {
                        try {
                            const parsedData = JSON.parse(payload);
                            if (Array.isArray(parsedData) && parsedData.length > 0) {
                                data = parsedData[0];
                                break;
                            }
                            if (!Array.isArray(parsedData) && parsedData) {
                                data = (_a = parsedData.data) !== null && _a !== void 0 ? _a : parsedData;
                                break;
                            }
                        }
                        catch (error) {
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
            this._insertTargetItem = (data, index, listId) => {
                const arr = this.cardCol();
                if (!data.status) {
                    data.status = { id: 2, name: "todo" };
                }
                if (listId === "activitiesList1") {
                    data.status.id = 2;
                    data.status.name = "todo";
                    data.status_id = 2;
                }
                else if (listId === "activitiesList2") {
                    data.status.id = 3;
                    data.status.name = "doing";
                    data.status_id = 3;
                }
                else if (listId === "activitiesList3") {
                    data.status.id = 4;
                    data.status.name = "blocked";
                    data.status_id = 4;
                }
                else if (listId === "activitiesList4") {
                    data.status.id = 5;
                    data.status.name = "done";
                    data.status_id = 5;
                }
                this.card(data);
                this.cardSelected(data);
                this.userSelected(true);
                this.updateCard();
            };
            this._removeSourceItem = () => {
                this.cardCol.valueHasMutated();
            };
            this.getLocalMaxCardId = () => {
                const collection = this.cardCol();
                if (!collection || !collection.models || collection.models.length === 0) {
                    return 0;
                }
                const ids = collection.models
                    .map((model) => {
                    var _a, _b, _c, _d, _e;
                    const asAny = model;
                    return Number((_e = (_c = (_a = model.get("id")) !== null && _a !== void 0 ? _a : (_b = asAny === null || asAny === void 0 ? void 0 : asAny.attributes) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : (_d = asAny === null || asAny === void 0 ? void 0 : asAny.attributes) === null || _d === void 0 ? void 0 : _d.card_id) !== null && _e !== void 0 ? _e : 0);
                })
                    .filter((id) => !Number.isNaN(id) && id > 0);
                return ids.length === 0 ? 0 : Math.max(...ids);
            };
            this.getNextCardId = () => __awaiter(this, void 0, void 0, function* () {
                const localMaxId = this.getLocalMaxCardId();
                try {
                    const response = yield fetch(this.ServerURLCards, {
                        method: "GET",
                    });
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    const data = yield response.json().catch(() => null);
                    const rawCards = Array.isArray(data)
                        ? data
                        : Array.isArray(data === null || data === void 0 ? void 0 : data.Card)
                            ? data.Card
                            : Array.isArray(data === null || data === void 0 ? void 0 : data.cards)
                                ? data.cards
                                : [];
                    const remoteIds = rawCards
                        .map((card) => { var _a, _b, _c; return Number((_c = (_b = (_a = card === null || card === void 0 ? void 0 : card.id) !== null && _a !== void 0 ? _a : card === null || card === void 0 ? void 0 : card.card_id) !== null && _b !== void 0 ? _b : card === null || card === void 0 ? void 0 : card.cardId) !== null && _c !== void 0 ? _c : 0); })
                        .filter((id) => !Number.isNaN(id) && id > 0);
                    const remoteMaxId = remoteIds.length === 0 ? 0 : Math.max(...remoteIds);
                    return Math.max(localMaxId, remoteMaxId) + 1;
                }
                catch (error) {
                    console.warn("Could not calculate the remote card id, using local fallback", error);
                    return localMaxId + 1;
                }
            });
            this.inicializar = () => __awaiter(this, void 0, void 0, function* () {
                const nextCardId = yield this.getNextCardId();
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
            });
            this.cardFilter = () => {
                this.isLoadingCards(true);
                const timeoutId = setTimeout(() => {
                    this.isLoadingCards(false);
                }, 1000);
                this.cardCol().fetch({
                    success: (collection) => {
                        clearTimeout(timeoutId);
                        const createFilteredCollection = (filteredData) => {
                            const modelArray = filteredData.map((card) => new (this.cardCol().model)(card));
                            return new (ojmodel_1.Collection.extend({
                                model: this.cardCol().model,
                                url: this.ServerURLCards,
                            }))(modelArray);
                        };
                        const data = collection.toJSON();
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
                        this.cardSourceTodo(new CollectionDataProvider(this.cardColTodo()));
                        this.cardSourceDoing(new CollectionDataProvider(this.cardColDoing()));
                        this.cardSourceBlocked(new CollectionDataProvider(this.cardColBlocked()));
                        this.cardSourceDone(new CollectionDataProvider(this.cardColDone()));
                        this.isLoadingCards(false);
                    },
                    error: (collection, error) => {
                    },
                });
            };
            this.isCardSourceEmpty = (statusID) => {
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
            this.createCollectionCards = () => {
                let MyCardCollection = ojmodel_1.Collection.extend({
                    url: this.ServerURLCards,
                    model: ojmodel_1.Model.extend({
                        urlRoot: this.ServerURLCards,
                        parse: this.parseCard,
                        parseSave: this.parseSaveCard,
                        idAttribute: "id",
                    }),
                    comparator: "id",
                });
                return new MyCardCollection();
            };
            this.createCollectionUser = () => {
                const parseSaveUser = (response) => {
                    return Object.assign({}, response);
                };
                const parseUser = (response) => {
                    return Object.assign({}, response);
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
                var _a, _b, _c;
                const collection = this.userCol();
                if (!collection)
                    return;
                const model = collection.get(this.userID);
                if (!model) {
                    console.warn("⚠️ User not found in userCol. userID =", this.userID);
                    return;
                }
                const boardsData = model.get("boards");
                const boards = ((_a = boardsData === null || boardsData === void 0 ? void 0 : boardsData.board) === null || _a === void 0 ? void 0 : _a.map((b) => ({ id: b.id, name: b.name }))) || [];
                const userAux = {
                    userId: Number((_c = (_b = model.get("userId")) !== null && _b !== void 0 ? _b : model.get("id")) !== null && _c !== void 0 ? _c : this.userID),
                    email: model.get("email"),
                    firstName: model.get("firstName"),
                    lastName: model.get("lastName"),
                    password: model.get("password"),
                    role: model.get("role") || { id: 0, name: "" },
                    boards: { board: boards }
                };
                this.user(userAux);
            };
            this.computeInitials = (fn, ln) => {
                return ojconverterutils_i18n_1.IntlConverterUtils.getInitials(fn, ln);
            };
            this.showCreateDialog = (event) => __awaiter(this, void 0, void 0, function* () {
                if (this.card().title != "") {
                    yield this.inicializar();
                }
                this.createStatusValue("2");
                document.getElementById("createDialog").open();
            });
            this.showEditDialog = (event) => {
                var _a, _b, _c;
                if (!this.cardSelected()) {
                    return;
                }
                const selected = this.cardSelected();
                const clonedCard = Object.assign(Object.assign({}, selected), { status: Object.assign({}, (selected.status || { id: 2, name: "todo" })), user: Object.assign({}, (selected.user || { id: Number(this.userID), firstName: "", lastName: "", email: "" })) });
                this.card(clonedCard);
                this.originalCardForEdit = {
                    title: clonedCard.title,
                    description: clonedCard.description,
                    startDate: clonedCard.startDate,
                    endDate: clonedCard.endDate,
                    priority: clonedCard.priority,
                    status_id: clonedCard.status_id,
                };
                this.statusValue(String((_c = (_a = this.card().status_id) !== null && _a !== void 0 ? _a : (_b = this.card().status) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : 2));
                document.getElementById("editDialog").open();
            };
            this.createCard = () => __awaiter(this, void 0, void 0, function* () {
                const editable = {
                    title: this.card().title,
                    description: this.card().description,
                    startDate: this.card().startDate,
                    endDate: this.card().endDate,
                    priority: this.card().priority,
                    status_id: Number(this.createStatusValue()),
                };
                if ((0, boards_validation_1.hasEmptyRequiredCardFields)(editable)) {
                    showLogAlert(this.t("cards.alertRequired"), "#f44336");
                    return;
                }
                if (!(0, boards_validation_1.isCardPriorityValid)(editable.priority)) {
                    showLogAlert(this.t("cards.alertPriority"), "#f44336");
                    return;
                }
                if (!(0, boards_validation_1.isCardDateRangeValid)(editable.startDate, editable.endDate)) {
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
                            id: yield this.getNextCardId(),
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
                    const response = yield fetch("http://localhost:8080/api/v1/cards/create", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(payload),
                    });
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    const rawResponse = yield response.text();
                    let createdCard = null;
                    if (rawResponse) {
                        try {
                            createdCard = JSON.parse(rawResponse);
                        }
                        catch (_a) {
                            createdCard = rawResponse;
                        }
                    }
                    this.cardFilter();
                    showLogAlert(this.t("cards.alertCreated"), "#1D4355");
                    document.getElementById("createDialog").close();
                }
                catch (error) {
                    console.error("Failed to create card:", error);
                    showLogAlert(this.t("cards.alertCreateError"), "#f44336");
                }
            });
            this.deleteCard = () => __awaiter(this, void 0, void 0, function* () {
                const cardId = this.card().id;
                if (!cardId) {
                    showLogAlert(this.t("cards.alertSelectDelete"), "#f44336");
                    return;
                }
                try {
                    const response = yield fetch(`http://localhost:8080/api/v1/cards/delete/${cardId}`, {
                        method: "DELETE",
                    });
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    this.cardFilter();
                    showLogAlert(this.t("cards.alertDeleted"), "#1D4355");
                    document.getElementById("editDialog").close();
                }
                catch (error) {
                    console.error("Failed to delete card:", error);
                    showLogAlert(this.t("cards.alertDeleteError"), "#f44336");
                }
            });
            this.updateCard = () => __awaiter(this, void 0, void 0, function* () {
                const selectedCard = this.cardSelected();
                if (!selectedCard) {
                    showLogAlert(this.t("cards.alertSelectUpdate"), "#f44336");
                    return;
                }
                const editDialog = document.getElementById("editDialog");
                const componentValue = (selector, index) => {
                    if (!editDialog) {
                        return undefined;
                    }
                    const components = editDialog.querySelectorAll(selector);
                    const element = components[index];
                    return element === null || element === void 0 ? void 0 : element.value;
                };
                const pickStringValue = (valueFromDialog, fallback) => {
                    return valueFromDialog === undefined || valueFromDialog === null
                        ? fallback
                        : String(valueFromDialog);
                };
                const pickPriorityValue = (valueFromDialog, fallback) => {
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
                const currentEditable = {
                    title: pickStringValue(titleFromDialog, this.card().title),
                    description: pickStringValue(descriptionFromDialog, this.card().description),
                    startDate: pickStringValue(startDateFromDialog, this.card().startDate),
                    endDate: pickStringValue(endDateFromDialog, this.card().endDate),
                    priority: pickPriorityValue(priorityFromDialog, this.card().priority),
                    status_id: this.card().status_id,
                };
                if (this.originalCardForEdit) {
                    if ((0, boards_validation_1.hasEmptyRequiredCardFields)(currentEditable)) {
                        showLogAlert(this.t("cards.alertRequired"), "#f44336");
                        return;
                    }
                    if (!(0, boards_validation_1.isCardPriorityValid)(currentEditable.priority)) {
                        showLogAlert(this.t("cards.alertPriority"), "#f44336");
                        return;
                    }
                    if (!(0, boards_validation_1.isCardDateRangeValid)(currentEditable.startDate, currentEditable.endDate)) {
                        showLogAlert(this.t("cards.alertDates"), "#f44336");
                        return;
                    }
                    if (!this.originalCardForEdit || !(0, boards_validation_1.hasCardChanges)(this.originalCardForEdit, currentEditable)) {
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
                    const response = yield fetch("http://localhost:8080/api/v1/cards/update", {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(row),
                    });
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    yield response.json().catch(() => null);
                    this.originalCardForEdit = Object.assign({}, currentEditable);
                    this.cardFilter();
                    showLogAlert(this.t("cards.alertUpdated"), "#1D4355");
                    document.getElementById("editDialog").close();
                }
                catch (error) {
                    console.error("Failed to update card:", error);
                    showLogAlert(this.t("cards.alertUpdateError"), "#f44336");
                }
            });
            this.selectedItemChangedTodo = (event) => __awaiter(this, void 0, void 0, function* () {
                if (event.detail.updatedFrom === "internal") {
                    const selectedCardId = event.detail.value;
                    const keys = selectedCardId.keys
                        .keys;
                    const selectedCard = yield this.cardSourceTodo().fetchByKeys({ keys });
                    this.cardSelected(Object.assign({}, selectedCard.results.get(Array.from(keys.values())[0]).data));
                    this.selectedItemDoing.clear();
                    this.selectedItemBlocked.clear();
                    this.selectedItemDone.clear();
                    this.userSelected(true);
                }
            });
            this.selectedItemChangedDoing = (event) => __awaiter(this, void 0, void 0, function* () {
                if (event.detail.updatedFrom === "internal") {
                    const selectedCardId = event.detail.value;
                    const keys = selectedCardId.keys
                        .keys;
                    const selectedCard = yield this.cardSourceDoing().fetchByKeys({ keys });
                    this.cardSelected(Object.assign({}, selectedCard.results.get(Array.from(keys.values())[0]).data));
                    this.selectedItemTodo.clear();
                    this.selectedItemBlocked.clear();
                    this.selectedItemDone.clear();
                    this.userSelected(true);
                }
            });
            this.selectedItemChangedBlocked = (event) => __awaiter(this, void 0, void 0, function* () {
                if (event.detail.updatedFrom === "internal") {
                    const selectedCardId = event.detail.value;
                    const keys = selectedCardId.keys
                        .keys;
                    const selectedCard = yield this.cardSourceBlocked().fetchByKeys({ keys });
                    this.cardSelected(Object.assign({}, selectedCard.results.get(Array.from(keys.values())[0]).data));
                    this.selectedItemTodo.clear();
                    this.selectedItemDoing.clear();
                    this.selectedItemDone.clear();
                    this.userSelected(true);
                }
            });
            this.selectedItemChangedDone = (event) => __awaiter(this, void 0, void 0, function* () {
                if (event.detail.updatedFrom === "internal") {
                    const selectedCardId = event.detail.value;
                    const keys = selectedCardId.keys
                        .keys;
                    const selectedCard = yield this.cardSourceDone().fetchByKeys({ keys });
                    this.cardSelected(Object.assign({}, selectedCard.results.get(Array.from(keys.values())[0]).data));
                    this.selectedItemTodo.clear();
                    this.selectedItemDoing.clear();
                    this.selectedItemBlocked.clear();
                    this.userSelected(true);
                }
            });
            this.isUserInBoard = (boardList) => {
                let res = false;
                boardList.forEach((board) => {
                    if (board.id == this.boardID) {
                        res = true;
                    }
                });
                return res;
            };
            this.logout = () => {
                sessionStorage.clear();
                window.location.href = "http://localhost:8080";
            };
            const ssUser = sessionStorage.getItem("user");
            const ssBoard = sessionStorage.getItem("boardId");
            const nameBoard = sessionStorage.getItem("boardName");
            const jsonObject = JSON.parse(ssUser);
            this.userID = jsonObject.userId;
            this.boardID = Number(ssBoard);
            this.boardName = nameBoard;
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
            this.card = ko.observable({
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
            this.selectedItemTodo = new ojknockout_keyset_1.ObservableKeySet(new ojkeyset_1.KeySetImpl());
            this.selectedItemDoing = new ojknockout_keyset_1.ObservableKeySet(new ojkeyset_1.KeySetImpl());
            this.selectedItemBlocked = new ojknockout_keyset_1.ObservableKeySet(new ojkeyset_1.KeySetImpl());
            this.selectedItemDone = new ojknockout_keyset_1.ObservableKeySet(new ojkeyset_1.KeySetImpl());
            this.dragItemId = 0;
            this.initials = ojconverterutils_i18n_1.IntlConverterUtils.getInitials(this.user().firstName, this.user().lastName);
            this.userCol(this.createCollectionUser());
            this.userCol()
                .fetch()
                .then(() => {
                this.getUser();
            })
                .catch((error) => {
                console.error("Error loading the collection:", error);
            });
            this.userDatasourse(new CollectionDataProvider(this.userCol()));
            this.loadSkeletonRowsFromStorage();
        }
        connected() {
        }
        disconnected() {
        }
        transitionCompleted() {
        }
    }
    return BoardsViewModel;
});
//# sourceMappingURL=boards.js.map