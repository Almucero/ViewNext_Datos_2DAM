define(["require", "exports", "chai", "viewModels/incidents"], function (require, exports, chai_1, IncidentsViewModel) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe("Incidents unit test", () => {
        let viewModel;
        console.log("Incidents unit test");
        beforeEach(() => {
            viewModel = new IncidentsViewModel();
            console.log("Created new instance of viewModel for test run");
        });
        it('messageText should be "Hello World"', () => {
            (0, chai_1.expect)(viewModel.messageText()).to.equal("Hello World");
        });
    });
});
