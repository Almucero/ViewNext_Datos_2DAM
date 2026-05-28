/// <reference types="ojcorerouter" />
/// <reference types="ojmodulerouter-adapter" />
/// <reference types="ojknockoutrouteradapter" />
import * as ko from "knockout";
import "ojs/ojdrawerpopup";
import "ojs/ojknockout";
import "ojs/ojmodule-element";
import CoreRouter from "ojs/ojcorerouter";
import ModuleRouterAdapter from "ojs/ojmodulerouter-adapter";
import KnockoutRouterAdapter from "ojs/ojknockoutrouteradapter";
interface CoreRouterDetail {
    label: string;
    iconClass: string;
}
type SupportedLanguage = "es" | "en";
declare class RootViewModel {
    manner: ko.Observable<string>;
    message: ko.Observable<string | undefined>;
    smScreen: ko.Observable<boolean> | undefined;
    mdScreen: ko.Observable<boolean> | undefined;
    router: CoreRouter<CoreRouterDetail> | undefined;
    moduleAdapter: ModuleRouterAdapter<CoreRouterDetail>;
    sideDrawerOn: ko.Observable<boolean>;
    navDataProvider: ko.Observable<any>;
    showHeaderNav: ko.Observable<boolean>;
    appName: ko.Observable<string>;
    userLogin: ko.Observable<string>;
    selection: KnockoutRouterAdapter<CoreRouterDetail>;
    currentUser: ko.Observable<any>;
    currentLanguage: ko.Observable<SupportedLanguage>;
    languageLabel: ko.PureComputed<"EN" | "ES">;
    private navItems;
    private translationObserver;
    private translationContainer;
    private isApplyingTranslations;
    constructor();
    announcementHandler: (event: any) => void;
    toggleDrawer: () => void;
    openedChangedHandler: (event: CustomEvent) => void;
    onLogoClick: (_data?: unknown, event?: Event) => boolean;
    goToProfile: () => void;
    logout: () => void;
    t: (key: string) => string;
    private updateNavLabels;
    private setupTranslationObserver;
    private applyTranslations;
    toggleLanguage: () => void;
}
declare const _default: RootViewModel;
export default _default;
