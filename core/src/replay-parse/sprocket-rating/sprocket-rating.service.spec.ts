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
    
    it("Should return all zeros", () => {
        const input = {
            goals: 0.0,
            assists: 0.0,
            shots: 0.0,
            saves: 0.0,
            goals_against: 0.0,
            shots_against: 0.0,
        };
        const result = {
            opi: 0.0, dpi: 0.0, gpi: 0.0,
        };

        expect(service.calcSprocketRating(input)).toStrictEqual(result);

    });

    it("Should give valid results", () => {
        const input = {
            goals: 1.0,
            assists: 2.0,
            shots: 7.0,
            saves: 1.0,
            goals_against: 4.0,
            shots_against: 5.0,
        };
        const result = {
            opi: 92.41236614475706,
            dpi: 27.36595668648241,
            gpi: 59.88916141561973,
        };

        expect(service.calcSprocketRating(input)).toStrictEqual(result);

    });

});
