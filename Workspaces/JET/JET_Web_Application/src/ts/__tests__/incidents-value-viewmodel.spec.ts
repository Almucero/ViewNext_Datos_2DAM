import { expect } from "chai";
// @ts-ignore
import IncidentsViewModel = require("viewModels/incidents");

describe("Incidents unit test", () => {
  let viewModel: IncidentsViewModel;
  console.log("Incidents unit test");

  // beforeEach function creates a new instance of
  // ViewModel before each test to ensure that each test
  // is independent and starts with a fresh state.

  beforeEach(() => {
    viewModel = new IncidentsViewModel();
    console.log("Created new instance of viewModel for test run");
  });

  it('messageText should be "Hello World"', () => {
    expect(viewModel.messageText()).to.equal("Hello World");
  });
});
