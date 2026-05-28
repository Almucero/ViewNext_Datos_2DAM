import ko = require("knockout");
import "ojs/ojbutton";
import "ojs/ojdialog";
import "ojs/ojformlayout";
import "ojs/ojinputtext";
import "ojs/ojknockout";
import "ojs/ojlabel";
import "ojs/ojlistview";
import { ojListView } from "ojs/ojlistview";
import "ojs/ojselectcombobox";
import "ojs/ojselectsingle";
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
declare class AdminViewModel {
    userLogin: ko.Observable<User>;
    user: ko.Observable<User>;
    userID: string;
    emailAux: String;
    t: (key: string) => string;
    userSelected: ko.Observable<boolean>;
    selectedUser: ko.Observable<User | null>;
    firstSelectedUser: ko.Observable<any>;
    private usersApiBase;
    private userCol;
    userDatasourse: ko.Observable;
    constructor();
    inicializar: () => void;
    createCollectionUser: () => any;
    getUser: () => void;
    private resolveRoleId;
    private normalizePassword;
    private refreshUsers;
    openCreateUserDialog: () => void;
    openAsignDialog: () => void;
    closeAsignDialog: () => void;
    closeCreateUserDialog: () => void;
    openUpdateUserDialog: () => void;
    closeUpdateUserDialog: () => void;
    closeEmailDialog: () => void;
    openDeleteUserDialog: () => void;
    closeDeleteUserDialog: () => void;
    addUser: () => void;
    selectUser: (event: ojListView.selectedChanged<User["userId"], User>) => Promise<void>;
    updateUser: () => Promise<void>;
    updateEmailUser: () => Promise<void>;
    asignar: () => Promise<void>;
    deleteUser: () => void;
    getBoards: (boardList: Board[]) => string;
}
export = AdminViewModel;
