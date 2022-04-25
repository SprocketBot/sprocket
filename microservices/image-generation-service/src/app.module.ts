import {Module} from "@nestjs/common";

import {AdditionService} from "./addition/addition.service";
import {CalculatorController} from "./calculator/calculator.controller";
import {DivisionService} from "./division/division.service";
import {GlobalModule} from "./global.module";

@Module({
    imports: [GlobalModule],
    providers: [GlobalModule,
        AdditionService,
        DivisionService],
    controllers: [CalculatorController],
})
export class AppModule {}
