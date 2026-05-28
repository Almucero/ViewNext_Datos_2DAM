import ko = require("knockout");
import "ojs/ojbutton";
import "ojs/ojformlayout";
import "ojs/ojinputtext";
import "ojs/ojknockout";
import "ojs/ojlabel";
import { type EditableProfile } from "./profile.validation";
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
type Role = {
    id: number;
    name: string;
};
type Board = {
    id: number;
    name: string;
};
declare class ProfileViewModel {
    private UserCol;
    user: ko.Observable<User>;
    userID: number;
    updated: ko.Observable;
    originalProfile: EditableProfile;
    t: (key: string) => string;
    constructor();
    createCollectionUser: () => any;
    getUser: () => void;
    update: () => void;
    submit: () => void;
    logout: () => void;
}
export = ProfileViewModel;
