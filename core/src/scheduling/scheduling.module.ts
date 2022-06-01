import {Module} from "@nestjs/common";

import {DatabaseModule} from "../database";
import {MatchService} from "./match";
import {RoundService} from "./round";

@Module({
    imports: [DatabaseModule],
    providers: [MatchService, RoundService],
    exports: [MatchService, RoundService],
})
export class SchedulingModule {}
