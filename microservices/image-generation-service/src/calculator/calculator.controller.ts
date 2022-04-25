import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import {z} from "zod";

import {AdditionService} from "../addition/addition.service";
import {DivisionService} from "../division/division.service";


@Controller("calculator")
export class CalculatorController {

    private readonly addSchema = z.object({
        x: z.number(),
        y: z.number(),
    });

    private readonly divideSchema = z.object({
        x: z.number(),
        y: z.number().refine(val => val !== 0, {message: "Divisor must be non-zero"}),
    });

    constructor(
        private additionService: AdditionService,
        private divisionService: DivisionService,
    ) {}

    @MessagePattern({service: "calculator", operation: "add"})
    add(@Payload() payload: {}): number {
        const data = this.addSchema.parse(payload);
        return this.additionService.add(data.x, data.y);
    }

    @MessagePattern({service: "calculator", operation: "divide"})
    divide(@Payload() payload: {}): number {
        const data = this.divideSchema.parse(payload);
        return this.divisionService.divide(data.x, data.y);
    }
    
}
