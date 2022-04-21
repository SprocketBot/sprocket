import {Injectable} from "@nestjs/common";

@Injectable()
export class DivisionService {

    divide(dividend: number, divisor: number): number {
        if (divisor === 0) {
            throw new Error("Cannot divide by 0");
        }

        return dividend / divisor;
    }

}
