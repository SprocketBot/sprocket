import {Module} from "@nestjs/common";
import {DatabaseModule} from "src/database";

import {MatchService} from "./match/match.service";
import {RoundService} from "./round/round.service";

@Module({
    imports: [DatabaseModule],
    providers: [MatchService, RoundService],
    exports: [MatchService, RoundService],
})
export class SchedulingModule {}
