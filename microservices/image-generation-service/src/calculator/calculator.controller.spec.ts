import type {TestingModule} from "@nestjs/testing";
import {Test} from "@nestjs/testing";
import {ZodError} from "zod";

import {AdditionService} from "../addition/addition.service";
import {DivisionService} from "../division/division.service";
import {CalculatorController} from "./calculator.controller";

describe("CalculatorController", () => {
    let controller: CalculatorController;
    let additionService: AdditionService;
    let divisionService: DivisionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CalculatorController],
            providers: [AdditionService, DivisionService],
        }).compile();

        controller = module.get<CalculatorController>(CalculatorController);
        additionService = module.get<AdditionService>(AdditionService);
        divisionService = module.get<DivisionService>(DivisionService);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("add()", () => {
        it("should return the result of AdditionService.add()", () => {
            const input = {x: 1, y: 2};

            const expected = 99;
            const mockAdd = jest.spyOn(additionService, "add").mockImplementation(() => expected);

            const actual = controller.add(input);

            expect(actual).toEqual(expected);
            expect(mockAdd).toHaveBeenCalledTimes(1);
            expect(mockAdd).toHaveBeenCalledWith(input.x, input.y);
        });
    });

    describe("divide()", () => {
        it("should return the result of DivisionService.divide()", () => {
            const input = {x: 1, y: 2};

            const expected = 99;
            const mockDivide = jest.spyOn(divisionService, "divide").mockImplementation(() => expected);

            const actual = controller.divide(input);

            expect(actual).toEqual(expected);
            expect(mockDivide).toHaveBeenCalledTimes(1);
            expect(mockDivide).toHaveBeenCalledWith(input.x, input.y);
        });

        it("should throw an error when dividing by 0", () => {
            const input = {x: 1, y: 0};

            const mockDivide = jest.spyOn(divisionService, "divide").mockImplementation();

            try {
                controller.divide(input);
            } catch (e) {
                expect(e).toBeInstanceOf(ZodError);
                const ze = e as ZodError;
                expect(ze.issues.length).toEqual(1);
                expect(ze.issues[0].message).toEqual("Divisor must be non-zero");
                expect(ze.issues[0].path).toEqual(["y"]);
            }

            expect(mockDivide).not.toHaveBeenCalled();
        });
    });
});
