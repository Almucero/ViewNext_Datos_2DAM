/**
 * Archivo: ts/viewModels/__tests__/login.spec.ts
 * Proposito: Define logica de UI, estado observable, validaciones y llamadas async de este modulo.
 * Nota: Los comentarios priorizan flujo, side-effects y decisiones de integracion.
 */
/// <reference types="mocha" />
/// <reference types="chai" />

export {};

declare const expect: Chai.ExpectStatic;
declare const sinon: any;
declare const require: any;

type LoginViewModelCtor = new () => {
  user: {
    email: (value?: string) => string;
    password: (value?: string) => string;
  };
  mensaje: (value?: string) => string;
  acceder: () => void;
};

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

const loadLoginViewModel = (): Promise<LoginViewModelCtor> =>
  new Promise((resolve, reject) => {
    require(["viewModels/login"], (LoginViewModelModule: any) => {
      resolve(LoginViewModelModule.default || LoginViewModelModule);
    }, reject);
  });

describe("Login ViewModel - submit", () => {
  let fetchStub: any;

  beforeEach(() => {
    fetchStub = sinon.stub(window as any, "fetch");
  });

  afterEach(() => {
    fetchStub.restore();
  });

  it("muestra error y no llama a red cuando falta usuario o contraseña", async () => {
    const LoginViewModel = await loadLoginViewModel();
    const vm = new LoginViewModel();

    vm.user.email("");
    vm.user.password("");

    vm.acceder();

    expect(vm.mensaje()).to.equal("Debes completar usuario y contraseña");
    expect(fetchStub.called).to.equal(false);
  });

  it("muestra error y no llama a red cuando el email no es válido", async () => {
    const LoginViewModel = await loadLoginViewModel();
    const vm = new LoginViewModel();

    vm.user.email("usuario@dominio..com");
    vm.user.password("1234");

    vm.acceder();

    expect(vm.mensaje()).to.equal("El email no tiene un formato válido");
    expect(fetchStub.called).to.equal(false);
  });

  it("si ambos campos tienen contenido, intenta autenticación", async () => {
    const LoginViewModel = await loadLoginViewModel();
    const vm = new LoginViewModel();

    fetchStub.resolves({
      json: () => Promise.resolve({ User: [] })
    } as any);

    vm.user.email("test@hive5.com");
    vm.user.password("1234");

    vm.acceder();
    await flushPromises();
    await flushPromises();

    expect(fetchStub.calledOnce).to.equal(true);
    expect(vm.mensaje()).to.equal("Usuario o contraseña incorrectos");
  });
});
