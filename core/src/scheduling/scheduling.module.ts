import {Module} from "@nestjs/common";

import {DatabaseModule} from "../database";
import {FranchiseModule} from "../franchise";
import {MatchService} from "./match";
import {RoundService} from "./round";
import {ScheduleFixtureResolver} from "./schedule-fixture/schedule-fixture.resolver";
import {ScheduleFixtureService} from "./schedule-fixture/schedule-fixture.service";
import {ScheduleGroupModResolver} from "./schedule-group/schedule-group.mod.resolver";
import {ScheduleGroupResolver} from "./schedule-group/schedule-group.resolver";
import {ScheduleGroupService} from "./schedule-group/schedule-group.service";
import {ScheduleGroupTypeService} from "./schedule-group/schedule-group-type.service";

@Module({
    imports: [DatabaseModule, FranchiseModule],
    providers: [MatchService, RoundService, ScheduleGroupModResolver, ScheduleGroupResolver, ScheduleGroupService, ScheduleGroupTypeService, ScheduleFixtureService, ScheduleFixtureResolver],
    exports: [MatchService, RoundService],
})
export class SchedulingModule {}
