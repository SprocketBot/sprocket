import type {TestingModule} from "@nestjs/testing";
import {Test} from "@nestjs/testing";

import {AdditionService} from "./addition.service";

describe("AdditionService", () => {
    let service: AdditionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AdditionService],
        }).compile();

        service = module.get<AdditionService>(AdditionService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("add()", () => {
        it("should return the sum of two numbers", () => {
            const x = 42;
            const y = 999999;
            const expected = 1000041;

            const actual = service.add(x, y);

            expect(actual).toEqual(expected);
        });

        it("should return the sum of two negative numbers", () => {
            const x = -123;
            const y = -54;
            const expected = -177;

            const actual = service.add(x, y);

            expect(actual).toEqual(expected);
        });

        it("should return the sum of a negative number and a positive number", () => {
            const x = -133;
            const y = 763;
            const expected = 630;

            const actual = service.add(x, y);

            expect(actual).toEqual(expected);
        });

        it("should return the sum of two numbers when the result is 0", () => {
            const x = 150;
            const y = -150;
            const expected = 0;

            const actual = service.add(x, y);

            expect(actual).toEqual(expected);
        });

        it("should return the sum of two numbers when one number is 0", () => {
            const x = 10;
            const y = 0;
            const expected = 10;

            const actual = service.add(x, y);

            expect(actual).toEqual(expected);
        });

        it("should return the sum of two numbers when both are 0", () => {
            const x = 0;
            const y = 0;
            const expected = 0;

            const actual = service.add(x, y);

            expect(actual).toEqual(expected);
        });

        it("should return the sum of two very large numbers", () => {
            const x = 999999999999999;
            const y = 999999999999999;
            const expected = 1999999999999998;

            const actual = service.add(x, y);

            expect(actual).toEqual(expected);
        });
    });
});
