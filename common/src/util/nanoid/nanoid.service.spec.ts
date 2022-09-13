import type {TestingModule} from "@nestjs/testing";
import {Test} from "@nestjs/testing";

import {NanoidService} from "./nanoid.service";

describe("NanoidService", () => {
    let service: NanoidService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [NanoidService],
        }).compile();

        service = module.get<NanoidService>(NanoidService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
