import type {TestingModule} from "@nestjs/testing";
import {Test} from "@nestjs/testing";

import {SprocketRatingService} from "./sprocket-rating.service";

describe("SprocketRatingService", () => {
    let service: SprocketRatingService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [SprocketRatingService],
        }).compile();

        service = module.get<SprocketRatingService>(SprocketRatingService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
