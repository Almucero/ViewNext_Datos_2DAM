var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "ojs/ojmodel", "knockout", "ojs/ojcollectiondataprovider", "ojs/ojasyncvalidator-length", "ojs/ojarraydataprovider", "./boardsList.validation", "ojs/ojbutton", "ojs/ojdialog", "ojs/ojformlayout", "ojs/ojinputtext", "ojs/ojlabelvalue", "ojs/ojlistview", "ojs/ojselectcombobox", "ojs/ojselectsingle"], function (require, exports, ojmodel_1, ko, CollectionDataProvider, AsyncLengthValidator, ArrayDataProvider, boardsList_validation_1) {
    "use strict";
    function showLogAlert(msg, color) {
        const div = document.createElement("div");
        div.className = "custom-log-alert";
        div.textContent = msg;
        div.style.backgroundColor = color;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 2000);
    }
    class BoardsListViewModel {
        constructor() {
            this.ServerURLBoardsGet = "http://localhost:8080/api/v1/boards/get-all";
            this.ServerURLBoardsUpdate = "http://localhost:8080/api/v1/boards/update";
            this.ServerURLCards = "http://localhost:8080/api/v1/cards/get-all";
            this.ServerURLUserBoardCreate = "http://localhost:8080/api/v1/user-boards/create";
            this.ServerURLUserBoardDelete = "http://localhost:8080/api/v1/user-boards/delete";
            this.ServerURLUserBoardGetAll = "http://localhost:8080/api/v1/user-boards/get-all";
            this.boardCol = ko.observable();
            this.boardSource = ko.observable();
            this.cardCol = ko.observable();
            this.isLoadingBoards = ko.observable(true);
            this.userBoardIds = new Set();
            this.t = (key) => {
                const i18n = window.hiveI18n;
                return i18n && typeof i18n.t === "function" ? i18n.t(key) : key;
            };
            this.parseBoard = (response) => {
                const b = response.Board ? response.Board : response;
                return Object.assign(Object.assign({}, b), { id: Number(b.id) });
            };
            this.parseCard = (response) => (Object.assign(Object.assign({}, response), { id: Number(response.id) }));
            this.extractBoardsFromText = (txt) => {
                var _a, _b, _c, _d, _e;
                try {
                    const parsed = JSON.parse(txt);
                    const normalizeBoards = (arr) => arr
                        .map((b) => { var _a; return ({ id: Number(b === null || b === void 0 ? void 0 : b.id), name: String((_a = b === null || b === void 0 ? void 0 : b.name) !== null && _a !== void 0 ? _a : "") }); })
                        .filter((b) => Number.isFinite(b.id));
                    if (Array.isArray(parsed)) {
                        return normalizeBoards(parsed);
                    }
                    if (Array.isArray(parsed === null || parsed === void 0 ? void 0 : parsed.Board)) {
                        return normalizeBoards(parsed.Board);
                    }
                    if (Array.isArray((_a = parsed === null || parsed === void 0 ? void 0 : parsed.BoardCollection) === null || _a === void 0 ? void 0 : _a.Board)) {
                        return normalizeBoards(parsed.BoardCollection.Board);
                    }
                    if (Array.isArray(parsed === null || parsed === void 0 ? void 0 : parsed.Boards)) {
                        return normalizeBoards(parsed.Boards);
                    }
                    if (parsed === null || parsed === void 0 ? void 0 : parsed.Board) {
                        const id = Number(parsed.Board.id);
                        return Number.isFinite(id) ? [{ id, name: String((_b = parsed.Board.name) !== null && _b !== void 0 ? _b : "") }] : [];
                    }
                    if ((_c = parsed === null || parsed === void 0 ? void 0 : parsed.BoardCollection) === null || _c === void 0 ? void 0 : _c.Board) {
                        const b = parsed.BoardCollection.Board;
                        const id = Number(b.id);
                        return Number.isFinite(id) ? [{ id, name: String((_d = b.name) !== null && _d !== void 0 ? _d : "") }] : [];
                    }
                }
                catch (_f) {
                }
                const boards = [];
                let cursor = 0;
                while (cursor < txt.length) {
                    const boardKeyIdx = txt.indexOf('"Board"', cursor);
                    if (boardKeyIdx === -1)
                        break;
                    const colonIdx = txt.indexOf(":", boardKeyIdx);
                    if (colonIdx === -1)
                        break;
                    const startIdx = txt.indexOf("{", colonIdx);
                    if (startIdx === -1)
                        break;
                    let depth = 0;
                    let endIdx = -1;
                    for (let i = startIdx; i < txt.length; i++) {
                        const ch = txt[i];
                        if (ch === "{")
                            depth++;
                        if (ch === "}") {
                            depth--;
                            if (depth === 0) {
                                endIdx = i;
                                break;
                            }
                        }
                    }
                    if (endIdx === -1)
                        break;
                    const objText = txt.slice(startIdx, endIdx + 1);
                    try {
                        const board = JSON.parse(objText);
                        const id = Number(board.id);
                        if (Number.isFinite(id)) {
                            boards.push({ id, name: String((_e = board.name) !== null && _e !== void 0 ? _e : "") });
                        }
                    }
                    catch (_g) {
                    }
                    cursor = endIdx + 1;
                }
                if (boards.length)
                    return boards;
                return [];
            };
            this.setBoardCount = (count) => {
                const normalizedCount = Number.isFinite(count) && count > 0 ? count : 4;
                this.boardCount(normalizedCount);
                this.skeletons(Array.from({ length: normalizedCount }, (_v, i) => i));
                sessionStorage.setItem("lastBoardCount", String(normalizedCount));
            };
            this.extractIdsFromRawText = (txt) => {
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
            this.collectKnownBoardIds = () => {
                var _a;
                const ids = [];
                if (this.boardCol() && this.boardCol().models) {
                    this.boardCol().models.forEach((board) => {
                        const id = Number(board.get("id"));
                        if (Number.isFinite(id))
                            ids.push(id);
                    });
                }
                const userBoardsRaw = (_a = this.user()) === null || _a === void 0 ? void 0 : _a.boards;
                const userBoards = Array.isArray(userBoardsRaw)
                    ? userBoardsRaw
                    : Array.isArray(userBoardsRaw === null || userBoardsRaw === void 0 ? void 0 : userBoardsRaw.board)
                        ? userBoardsRaw.board
                        : [];
                userBoards.forEach((b) => {
                    const id = Number(b === null || b === void 0 ? void 0 : b.id);
                    if (Number.isFinite(id))
                        ids.push(id);
                });
                try {
                    const ssUser = sessionStorage.getItem("user");
                    if (ssUser) {
                        const parsed = JSON.parse(ssUser);
                        const arr = Array.isArray(parsed === null || parsed === void 0 ? void 0 : parsed.boards) ? parsed.boards : [];
                        arr.forEach((b) => {
                            const id = Number(b === null || b === void 0 ? void 0 : b.id);
                            if (Number.isFinite(id))
                                ids.push(id);
                        });
                    }
                }
                catch (_b) {
                }
                return Array.from(new Set(ids));
            };
            this.createCollectionBoard = () => {
                const MyBoardCollection = ojmodel_1.Collection.extend({
                    url: this.ServerURLBoardsGet,
                    model: ojmodel_1.Model.extend({
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
            this.createCollectionCards = () => {
                const MyCardCollection = ojmodel_1.Collection.extend({
                    url: this.ServerURLCards,
                    model: ojmodel_1.Model.extend({
                        urlRoot: this.ServerURLCards,
                        parse: this.parseCard,
                        idAttribute: "id"
                    }),
                    comparator: "id"
                });
                return new MyCardCollection();
            };
            this.fetchUserBoardsFirst = () => __awaiter(this, void 0, void 0, function* () {
                try {
                    const txt = yield $.ajax({
                        url: this.ServerURLUserBoardGetAll,
                        method: "GET",
                        dataType: "text",
                        beforeSend: (xhr) => {
                            if (xhr && xhr.overrideMimeType)
                                xhr.overrideMimeType("text/plain; charset=UTF-8");
                        },
                        converters: { "* text": (res) => res }
                    });
                    this.userBoardIds = this.extractUserBoardIds(txt, Number(this.userID));
                }
                catch (e) {
                    console.error("❌ fetchUserBoardsFirst:", e);
                    this.userBoardIds = new Set();
                }
            });
            this.extractUserBoardIds = (txt, userId) => {
                const boardIds = new Set();
                try {
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(txt, "text/xml");
                    if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
                        const parsed = JSON.parse(txt);
                        const userBoards = Array.isArray(parsed) ? parsed : Array.isArray(parsed === null || parsed === void 0 ? void 0 : parsed.UserBoard) ? parsed.UserBoard : [];
                        userBoards.forEach((ub) => {
                            var _a, _b;
                            const fetchedUserId = Number((_a = ub === null || ub === void 0 ? void 0 : ub.userId) !== null && _a !== void 0 ? _a : ub === null || ub === void 0 ? void 0 : ub.user_id);
                            const boardId = Number((_b = ub === null || ub === void 0 ? void 0 : ub.boardId) !== null && _b !== void 0 ? _b : ub === null || ub === void 0 ? void 0 : ub.board_id);
                            if (fetchedUserId === userId && Number.isFinite(boardId)) {
                                boardIds.add(boardId);
                            }
                        });
                    }
                    else {
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
                }
                catch (e) {
                    console.error("Error parsing user boards XML/JSON:", e);
                }
                return boardIds;
            };
            this.createUserBoard = (userId, boardId) => {
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
                        error: (err) => {
                            console.error(`❌ Error creating user board:`, err);
                            resolve(false);
                        }
                    });
                });
            };
            this.deleteUserBoard = (userId, boardId) => {
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
                        error: (err) => {
                            console.error(`❌ Error deleting user board:`, err);
                            resolve(false);
                        }
                    });
                });
            };
            this.refreshBoards = () => __awaiter(this, void 0, void 0, function* () {
                yield this.fetchBoardsManual();
            });
            this.getNextBoardId = () => __awaiter(this, void 0, void 0, function* () {
                try {
                    const txt = yield $.ajax({
                        url: this.ServerURLBoardsGet,
                        method: "GET",
                        dataType: "text",
                        beforeSend: (xhr) => {
                            if (xhr && xhr.overrideMimeType)
                                xhr.overrideMimeType("text/plain; charset=UTF-8");
                        },
                        converters: { "* text": (res) => res }
                    });
                    const networkIds = this.extractBoardsFromText(txt)
                        .map((b) => Number(b.id))
                        .filter((id) => Number.isFinite(id));
                    this.extractIdsFromRawText(txt).forEach((id) => networkIds.push(id));
                    const uniqueIds = Array.from(new Set(networkIds));
                    const maxId = uniqueIds.length ? Math.max(...uniqueIds) : 0;
                    this.lastGeneratedBoardId = maxId + 1;
                    return this.lastGeneratedBoardId;
                }
                catch (error) {
                    console.error("[getNextBoardId] Error fetching boards:", error);
                    this.lastGeneratedBoardId = Math.max(this.lastGeneratedBoardId + 1, 1);
                    return this.lastGeneratedBoardId;
                }
            });
            this.getLocalMaxCardId = () => {
                const collection = this.cardCol();
                if (!collection || !collection.models || collection.models.length === 0) {
                    return 0;
                }
                const ids = collection.models
                    .map((cardModel) => {
                    var _a, _b, _c;
                    const raw = (cardModel === null || cardModel === void 0 ? void 0 : cardModel.toJSON) ? cardModel.toJSON() : {};
                    return Number((_c = (_b = (_a = raw === null || raw === void 0 ? void 0 : raw.id) !== null && _a !== void 0 ? _a : raw === null || raw === void 0 ? void 0 : raw.card_id) !== null && _b !== void 0 ? _b : raw === null || raw === void 0 ? void 0 : raw.cardId) !== null && _c !== void 0 ? _c : 0);
                })
                    .filter((id) => Number.isFinite(id) && id > 0);
                return ids.length ? Math.max(...ids) : 0;
            };
            this.getNextCardId = () => __awaiter(this, void 0, void 0, function* () {
                const localMaxId = this.getLocalMaxCardId();
                try {
                    yield this.cardCol().fetch();
                    const remoteIds = this.cardCol().models
                        .map((cardModel) => {
                        var _a, _b, _c;
                        const raw = (cardModel === null || cardModel === void 0 ? void 0 : cardModel.toJSON) ? cardModel.toJSON() : {};
                        return Number((_c = (_b = (_a = raw === null || raw === void 0 ? void 0 : raw.id) !== null && _a !== void 0 ? _a : raw === null || raw === void 0 ? void 0 : raw.card_id) !== null && _b !== void 0 ? _b : raw === null || raw === void 0 ? void 0 : raw.cardId) !== null && _c !== void 0 ? _c : 0);
                    })
                        .filter((id) => Number.isFinite(id) && id > 0);
                    const remoteMaxId = remoteIds.length ? Math.max(...remoteIds) : 0;
                    return Math.max(localMaxId, remoteMaxId) + 1;
                }
                catch (error) {
                    console.warn("Could not calculate the next card id, using local fallback", error);
                    return localMaxId + 1;
                }
            });
            this.boardChanged = () => {
                this.rebuildBoardsProviders();
            };
            this.inicializar = () => {
                this.board({ id: 0, name: "", users: [] });
            };
            this.showCreateDialog = () => {
                if (this.board().name !== "")
                    this.inicializar();
                document.getElementById("createDialog").open();
            };
            this.showExportDialog = () => __awaiter(this, void 0, void 0, function* () {
                this.sendBoardId(0);
                this.receivedBoardId(0);
                yield this.refreshBoards();
                document.getElementById("exportDialog").open();
            });
            this.showEditDialog = (event, context) => {
                if (!context || context.key == null)
                    return;
                const id = Number(context.key);
                const m = this.boardCol().get(id);
                if (!m)
                    return;
                this.board({
                    id: m.get("id"),
                    name: m.get("name"),
                    users: m.get("users")
                });
                this.originalBoardName = String(m.get("name") || "");
                document.getElementById("editDialog").open();
            };
            this.createBoard = () => __awaiter(this, void 0, void 0, function* () {
                try {
                    const boardName = (0, boardsList_validation_1.normalizeBoardName)(this.board().name);
                    if (!(0, boardsList_validation_1.isBoardNameNotEmpty)(boardName)) {
                        showLogAlert("Board name is required", "#f44336");
                        return;
                    }
                    const nextBoardId = yield this.getNextBoardId();
                    const payload = {
                        Board: [
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
                        success: () => __awaiter(this, void 0, void 0, function* () {
                            const created = yield this.createUserBoard(Number(this.userID), nextBoardId);
                            if (!created) {
                                showLogAlert("Board created but linking failed", "#ff9800");
                            }
                            yield this.refreshBoards();
                            document.getElementById("createDialog").close();
                            document.getElementById("cardsHeader").focus();
                        }),
                        error: (err) => __awaiter(this, void 0, void 0, function* () {
                            try {
                                const txt = yield $.ajax({
                                    url: this.ServerURLBoardsGet,
                                    method: "GET",
                                    dataType: "text",
                                    beforeSend: (xhr) => {
                                        if (xhr && xhr.overrideMimeType)
                                            xhr.overrideMimeType("text/plain; charset=UTF-8");
                                    },
                                    converters: { "* text": (res) => res }
                                });
                                const boards = this.extractBoardsFromText(txt);
                                const boardExists = boards.some((b) => Number(b.id) === nextBoardId);
                                if (boardExists) {
                                    const created = yield this.createUserBoard(Number(this.userID), nextBoardId);
                                    if (!created) {
                                        showLogAlert("Board created but linking failed", "#ff9800");
                                    }
                                    yield this.refreshBoards();
                                    document.getElementById("createDialog").close();
                                    document.getElementById("cardsHeader").focus();
                                    return;
                                }
                            }
                            catch (checkError) {
                                console.error("Error checking if board was created:", checkError);
                            }
                            setTimeout(() => {
                                location.reload();
                            }, 5000);
                        })
                    });
                }
                catch (err) {
                }
            });
            this.updateBoard = () => {
                const nextName = (0, boardsList_validation_1.normalizeBoardName)(this.board().name);
                if (!(0, boardsList_validation_1.isBoardNameNotEmpty)(nextName)) {
                    showLogAlert("Board name cannot be empty", "#f44336");
                    return;
                }
                if (!(0, boardsList_validation_1.isBoardNameChanged)(this.originalBoardName, nextName)) {
                    showLogAlert("You must change the board name", "#f44336");
                    return;
                }
                const payload = {
                    Board: [
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
                    success: (resp) => __awaiter(this, void 0, void 0, function* () {
                        this.originalBoardName = nextName;
                        document.getElementById("editDialog").close();
                        document.getElementById("cardsHeader").focus();
                        yield this.refreshBoards();
                    }),
                    error: (err) => {
                        setTimeout(() => {
                            location.reload();
                        }, 5000);
                    }
                });
            };
            this.deleteBoard = (event, context, move) => __awaiter(this, void 0, void 0, function* () {
                let idDelete = this.sendBoardId();
                if (context)
                    idDelete = Number(context.key);
                const m = this.boardCol().get(idDelete);
                if (!m)
                    return;
                yield this.cardCol().fetch().catch(() => {
                });
                const cardsInBoard = this.getBoardCardCount(idDelete);
                if (!(0, boardsList_validation_1.canDeleteBoard)(cardsInBoard)) {
                    showLogAlert("Cannot delete: the board contains cards", "#f44336");
                    return;
                }
                const ok = move || window.confirm("Delete board?");
                if (!ok)
                    return;
                const urlDelete = `http://localhost:8080/api/v1/boards/delete/${idDelete}`;
                fetch(urlDelete, {
                    method: "DELETE",
                    headers: {
                        Accept: "application/json",
                    },
                })
                    .then((response) => __awaiter(this, void 0, void 0, function* () {
                    if (!response.ok)
                        throw new Error("Error en la respuesta del servidor");
                    yield this.deleteUserBoard(Number(this.userID), idDelete);
                    this.boardCol().remove(m);
                    showLogAlert("Board deleted", "#1D4355");
                    this.rebuildBoardsProviders();
                }))
                    .catch((err) => {
                    console.error("Error deleting board:", err);
                    showLogAlert("Error deleting board", "#f44336");
                });
            });
            this.getBoardCardCount = (boardId) => {
                if (!this.cardCol() || !this.cardCol().models)
                    return 0;
                return this.cardCol().models.filter((cardModel) => {
                    var _a, _b;
                    const raw = (cardModel === null || cardModel === void 0 ? void 0 : cardModel.toJSON) ? cardModel.toJSON() : {};
                    const byNested = Number((_a = raw === null || raw === void 0 ? void 0 : raw.board) === null || _a === void 0 ? void 0 : _a.id);
                    const byFlat = Number((_b = raw === null || raw === void 0 ? void 0 : raw.board_id) !== null && _b !== void 0 ? _b : raw === null || raw === void 0 ? void 0 : raw.boardId);
                    return byNested === Number(boardId) || byFlat === Number(boardId);
                }).length;
            };
            this.changeBoard = () => {
                this.cardCol().fetch().then(() => {
                    this.cardFilter();
                    this.cardCol().fetch().then(() => __awaiter(this, void 0, void 0, function* () {
                        try {
                            const updateRequests = this.cardCol().map((cardModel) => {
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
                            const responses = yield Promise.all(updateRequests);
                            const hasErrors = responses.some((response) => !response.ok);
                            if (hasErrors) {
                                showLogAlert("Error moving cards", "#f44336");
                                return;
                            }
                            showLogAlert("Cards moved", "#1D4355");
                            this.deleteBoard(undefined, undefined, true);
                            document.getElementById("exportDialog").close();
                            document.getElementById("cardsHeader").focus();
                        }
                        catch (error) {
                            showLogAlert("Error moving cards", "#f44336");
                        }
                    }));
                });
                this.refreshBoards().then(() => {
                    const send = this.boardCol().get(this.sendBoardId());
                    const receive = this.boardCol().get(this.receivedBoardId());
                    if (!send || !receive)
                        return;
                    this.board().id = this.receivedBoardId();
                    this.board().name = receive.get("name");
                    const mergedUsers = [
                        ...new Set([...receive.get("users"), ...send.get("users")])
                    ];
                    this.board().users = mergedUsers;
                    this.updateBoard();
                });
            };
            this.cardFilter = () => {
                this.cardCol().fetch({
                    success: (collection) => {
                        const cards = collection.toJSON();
                        const filtered = cards.filter((c) => Number(c.board.id) === Number(this.sendBoardId()));
                        const arr = filtered.map((c) => new (this.cardCol().model)(Object.assign(Object.assign({}, c), { id: Number(c.id) })));
                        const NewCollection = ojmodel_1.Collection.extend({
                            model: this.cardCol().model,
                            url: this.ServerURLCards
                        });
                        this.cardCol(new NewCollection(arr));
                    }
                });
            };
            this.selectedBoardChanged = (event) => {
                const selected = event.detail.value;
                const keys = Array.from(selected.values());
                const id = Number(keys[0]);
                const m = this.boardCol().get(id);
                if (!m)
                    return;
                sessionStorage.setItem("boardId", String(m.get("id")));
                sessionStorage.setItem("boardName", m.get("name"));
                window.location.href = "http://localhost:8000/?ojr=boards";
            };
            this.logout = () => {
                sessionStorage.clear();
                window.location.href = "http://localhost:8000";
            };
            this.validatorTitle = ko.observableArray([new AsyncLengthValidator({ min: 4, max: 30 })]);
            this.sendBoardId = ko.observable(0);
            this.receivedBoardId = ko.observable(0);
            const ssUser = sessionStorage.getItem("user");
            const json = JSON.parse(ssUser);
            this.userID = json.userId;
            this.user = ko.observable({
                id: json.userId,
                email: json.email,
                firstName: json.firstName,
                lastName: json.lastName,
                role: { id: json.roleId, name: json.roleName },
                boards: json.boards
            });
            this.board = ko.observable({ id: 0, name: "", users: [] });
            this.boardCol(this.createCollectionBoard());
            this.cardCol(this.createCollectionCards());
            this.boardSource(new CollectionDataProvider(this.boardCol()));
            const savedBoardCount = Number(sessionStorage.getItem("lastBoardCount"));
            const initialBoardCount = Number.isFinite(savedBoardCount) && savedBoardCount > 0 ? savedBoardCount : 4;
            this.boardCount = ko.observable(initialBoardCount);
            this.skeletons = ko.observableArray(Array.from({ length: initialBoardCount }, (_v, i) => i));
            this.browsersBoard = [];
            this.boardsDPSend = ko.observable(new ArrayDataProvider([], { keyAttributes: "value" }));
            this.boardsDPReceive = ko.observable(new ArrayDataProvider([], { keyAttributes: "value" }));
            this.lastGeneratedBoardId = 0;
            this.originalBoardName = "";
            this.fetchUserBoardsFirst().then(() => {
                this.fetchBoardsManual();
            });
            window.boardsListVM = this;
        }
        fetchBoardsManual() {
            return __awaiter(this, void 0, void 0, function* () {
                this.isLoadingBoards(true);
                try {
                    const txt = yield $.ajax({
                        url: this.ServerURLBoardsGet,
                        method: "GET",
                        dataType: "text",
                        beforeSend: (xhr) => {
                            if (xhr && xhr.overrideMimeType)
                                xhr.overrideMimeType("text/plain; charset=UTF-8");
                        },
                        converters: { "* text": (res) => res }
                    });
                    let items = this.extractBoardsFromText(txt);
                    items = items.filter((board) => this.userBoardIds.has(Number(board.id)));
                    this.setBoardCount(items.length);
                    this.boardCol().reset(items);
                    this.rebuildBoardsProviders();
                    this.boardSource(new CollectionDataProvider(this.boardCol()));
                }
                catch (e) {
                    console.error("❌ fetchBoardsManual:", e);
                }
                finally {
                    this.isLoadingBoards(false);
                }
            });
        }
        rebuildBoardsProviders() {
            const unique = new Map();
            this.boardCol().models.forEach((board) => {
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
        connected() { }
        disconnected() { }
        transitionCompleted() { }
    }
    return BoardsListViewModel;
});
//# sourceMappingURL=boardsList.js.map