import type {TestingModule} from "@nestjs/testing";
import {Test} from "@nestjs/testing";

import {IgActionsController} from "./ig-actions.controller";

describe("IgActionsController", () => {
    let controller: IgActionsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [IgActionsController],
        }).compile();

        controller = module.get<IgActionsController>(IgActionsController);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
