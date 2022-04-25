import type {TestingModule} from "@nestjs/testing";
import {Test} from "@nestjs/testing";

import {ScrimCrudService} from "./scrim-crud.service";

describe("ScrimCrudService", () => {
    let service: ScrimCrudService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ScrimCrudService],
        }).compile();

        service = module.get<ScrimCrudService>(ScrimCrudService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
