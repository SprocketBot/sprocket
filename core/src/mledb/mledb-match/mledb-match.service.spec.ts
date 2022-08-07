import type {TestingModule} from "@nestjs/testing";
import {Test} from "@nestjs/testing";

import {MledbMatchService} from "./mledb-match.service";

describe("MledbMatchService", () => {
    let service: MledbMatchService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MledbMatchService],
        }).compile();

        service = module.get<MledbMatchService>(MledbMatchService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
