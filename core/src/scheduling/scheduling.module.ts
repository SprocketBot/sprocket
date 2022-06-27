import {Module} from "@nestjs/common";

import {DatabaseModule} from "../database";
import {FranchiseModule} from "../franchise";
import {UtilModule} from "../util/util.module";
import {MatchService} from "./match";
import {MatchResolver} from "./match/match.resolver";
import {RoundService} from "./round";
import {ScheduleFixtureResolver} from "./schedule-fixture/schedule-fixture.resolver";
import {ScheduleFixtureService} from "./schedule-fixture/schedule-fixture.service";
import {ScheduleGroupModResolver} from "./schedule-group/schedule-group.mod.resolver";
import {ScheduleGroupResolver} from "./schedule-group/schedule-group.resolver";
import {ScheduleGroupService} from "./schedule-group/schedule-group.service";
import {ScheduleGroupTypeService} from "./schedule-group/schedule-group-type.service";

@Module({
    imports: [DatabaseModule, FranchiseModule, UtilModule],
    providers: [MatchService, RoundService, ScheduleGroupModResolver, ScheduleGroupResolver, ScheduleGroupService, ScheduleGroupTypeService, ScheduleFixtureService, ScheduleFixtureResolver, MatchResolver],
    exports: [MatchService, RoundService],
})
export class SchedulingModule {}
