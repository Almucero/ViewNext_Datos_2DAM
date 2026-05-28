var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));
    const loadLoginViewModel = () => new Promise((resolve, reject) => {
        require(["viewModels/login"], (LoginViewModelModule) => {
            resolve(LoginViewModelModule.default || LoginViewModelModule);
        }, reject);
    });
    describe("Login ViewModel - submit", () => {
        let fetchStub;
        beforeEach(() => {
            fetchStub = sinon.stub(window, "fetch");
        });
        afterEach(() => {
            fetchStub.restore();
        });
        it("muestra error y no llama a red cuando falta usuario o contraseña", () => __awaiter(void 0, void 0, void 0, function* () {
            const LoginViewModel = yield loadLoginViewModel();
            const vm = new LoginViewModel();
            vm.user.email("");
            vm.user.password("");
            vm.acceder();
            expect(vm.mensaje()).to.equal("Debes completar usuario y contraseña");
            expect(fetchStub.called).to.equal(false);
        }));
        it("muestra error y no llama a red cuando el email no es válido", () => __awaiter(void 0, void 0, void 0, function* () {
            const LoginViewModel = yield loadLoginViewModel();
            const vm = new LoginViewModel();
            vm.user.email("usuario@dominio..com");
            vm.user.password("1234");
            vm.acceder();
            expect(vm.mensaje()).to.equal("El email no tiene un formato válido");
            expect(fetchStub.called).to.equal(false);
        }));
        it("si ambos campos tienen contenido, intenta autenticación", () => __awaiter(void 0, void 0, void 0, function* () {
            const LoginViewModel = yield loadLoginViewModel();
            const vm = new LoginViewModel();
            fetchStub.resolves({
                json: () => Promise.resolve({ User: [] })
            });
            vm.user.email("test@hive5.com");
            vm.user.password("1234");
            vm.acceder();
            yield flushPromises();
            yield flushPromises();
            expect(fetchStub.calledOnce).to.equal(true);
            expect(vm.mensaje()).to.equal("Usuario o contraseña incorrectos");
        }));
    });
});
//# sourceMappingURL=login.spec.js.map