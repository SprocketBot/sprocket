import type {TestingModule} from "@nestjs/testing";
import {Test} from "@nestjs/testing";

import {ScrimMetricsService} from "./scrim-metrics.service";

describe("ScrimMetricsService", () => {
    let service: ScrimMetricsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ScrimMetricsService],
        }).compile();

        service = module.get<ScrimMetricsService>(ScrimMetricsService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
