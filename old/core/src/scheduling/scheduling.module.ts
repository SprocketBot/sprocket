import {forwardRef, Module} from "@nestjs/common";
import {EventsModule, SubmissionModule} from "@sprocketbot/common";

import {DatabaseModule} from "../database";
import {EloConnectorModule} from "../elo/elo-connector";
import {FranchiseModule} from "../franchise";
import {MledbInterfaceModule} from "../mledb/mledb-interface.module";
import {UtilModule} from "../util/util.module";
import {MatchService} from "./match";
import {MatchController} from "./match/match.controller";
import {MatchResolver} from "./match/match.resolver";
import {MatchParentResolver} from "./match-parent/match-parent.resolver";
import {RoundService} from "./round";
import {ScheduleFixtureResolver} from "./schedule-fixture/schedule-fixture.resolver";
import {ScheduleFixtureService} from "./schedule-fixture/schedule-fixture.service";
import {ScheduleGroupModResolver} from "./schedule-group/schedule-group.mod.resolver";
import {ScheduleGroupResolver} from "./schedule-group/schedule-group.resolver";
import {ScheduleGroupService} from "./schedule-group/schedule-group.service";
import {ScheduleGroupTypeService} from "./schedule-group/schedule-group-type.service";

@Module({
    imports: [
        UtilModule,
        DatabaseModule,
        EloConnectorModule,
        forwardRef(() => FranchiseModule),
        forwardRef(() => MledbInterfaceModule),
        EventsModule,
        SubmissionModule,
    ],
    providers: [
        MatchService,
        RoundService,
        ScheduleGroupModResolver,
        ScheduleGroupResolver,
        ScheduleGroupService,
        ScheduleGroupTypeService,
        ScheduleFixtureService,
        ScheduleFixtureResolver,
        MatchResolver,
        MatchParentResolver,
    ],
    exports: [
        MatchService,
        RoundService,
    ],
    controllers: [
        MatchController,
    ],
})
export class SchedulingModule {}
