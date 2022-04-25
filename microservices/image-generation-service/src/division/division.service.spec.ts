import type {TestingModule} from "@nestjs/testing";
import {Test} from "@nestjs/testing";

import {DivisionService} from "./division.service";

describe("DivisionService", () => {
    let service: DivisionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DivisionService],
        }).compile();

        service = module.get<DivisionService>(DivisionService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("divide()", () => {
        it("should divide two numbers", () => {
            const x = 6;
            const y = 3;
            const expected = 2;

            const actual = service.divide(x, y);

            expect(actual).toEqual(expected);
        });

        it("should throw an error if the divisor is 0", () => {
            const x = 6;
            const y = 0;

            expect(() => service.divide(x, y)).toThrow("Cannot divide by 0");
        });

        it("should return 0 if the dividend is 0", () => {
            const x = 0;
            const y = 3;
            const expected = 0;

            const actual = service.divide(x, y);

            expect(actual).toEqual(expected);
        });

        it("should divide two very large numbers", () => {
            const x = 999999999999999;
            const y = 111111111111111;
            const expected = 9;

            const actual = service.divide(x, y);

            expect(actual).toEqual(expected);
        });

        it("should divide two numbers when the result is not a whole number", () => {
            const x = 22;
            const y = 7;
            const expected = 3.14285714286;

            const actual = service.divide(x, y);

            expect(actual).toBeCloseTo(expected);
        });

    });
});
