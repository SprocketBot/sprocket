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

    it("GT's SR Test #1, Fresh", () => {
        const input = {
            goals: 9.0 / 5.0,
            assists: 8.0 / 5.0,
            shots: 28.0 / 5.0,
            saves: 5.0 / 5.0,
            goals_against: 7.0 / 5.0,
            shots_against: 24.0 / 5.0,
        };
        const result = {
            opi: 86.7,
            dpi: 82.0,
            gpi: 84.3,
        };

        expect(Math.round(service.calcSprocketRating(input).opi * 10.0) / 10.0).toStrictEqual(result.opi);
        expect(Math.round(service.calcSprocketRating(input).dpi * 10.0) / 10.0).toStrictEqual(result.dpi);
        expect(Math.round(service.calcSprocketRating(input).gpi * 10.0) / 10.0).toStrictEqual(result.gpi);

    });

    it("GT's SR Test #2, Zyta", () => {
        const input = {
            goals: 19.0 / 5.0,
            assists: 5.0 / 5.0,
            shots: 37.0 / 5.0,
            saves: 5.0 / 5.0,
            goals_against: 7.0 / 5.0,
            shots_against: 24.0 / 5.0,
        };
        const result = {
            opi: 95.8,
            dpi: 82.0,
            gpi: 88.9,
        };

        expect(Math.round(service.calcSprocketRating(input).opi * 10.0) / 10.0).toStrictEqual(result.opi);
        expect(Math.round(service.calcSprocketRating(input).dpi * 10.0) / 10.0).toStrictEqual(result.dpi);
        expect(Math.round(service.calcSprocketRating(input).gpi * 10.0) / 10.0).toStrictEqual(result.gpi);

    });

    it("GT's SR Test #3, AJBinky", () => {
        const input = {
            goals: 2.0 / 5.0,
            assists: 3.0 / 5.0,
            shots: 13.0 / 5.0,
            saves: 24.0 / 5.0,
            goals_against: 28.0 / 5.0,
            shots_against: 65.0 / 5.0,
        };
        const result = {
            opi: 17.3,
            dpi: 31.2,
            gpi: 24.2,
        };

        expect(Math.round(service.calcSprocketRating(input).opi * 10.0) / 10.0).toStrictEqual(result.opi);
        expect(Math.round(service.calcSprocketRating(input).dpi * 10.0) / 10.0).toStrictEqual(result.dpi);
        expect(Math.round(service.calcSprocketRating(input).gpi * 10.0) / 10.0).toStrictEqual(result.gpi);

    });

    it("GT's SR Test #4, Maple", () => {
        const input = {
            goals: 5.0 / 5.0,
            assists: 0.0 / 5.0,
            shots: 11.0 / 5.0,
            saves: 4.0 / 5.0,
            goals_against: 28.0 / 5.0,
            shots_against: 65.0 / 5.0,
        };
        const result = {
            opi: 12.1,
            dpi: 2.3,
            gpi: 7.2,
        };

        expect(Math.round(service.calcSprocketRating(input).opi * 10.0) / 10.0).toStrictEqual(result.opi);
        expect(Math.round(service.calcSprocketRating(input).dpi * 10.0) / 10.0).toStrictEqual(result.dpi);
        expect(Math.round(service.calcSprocketRating(input).gpi * 10.0) / 10.0).toStrictEqual(result.gpi);

    });

});
