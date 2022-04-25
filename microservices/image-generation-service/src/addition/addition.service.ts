import {Injectable} from "@nestjs/common";

@Injectable()
export class AdditionService {

    add(x: number, y: number): number {
        return x + y;
    }

}
