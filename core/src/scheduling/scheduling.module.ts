import {forwardRef, Module} from "@nestjs/common";
import {EventsModule, SubmissionModule} from "@sprocketbot/common";

import {DatabaseModule} from "../database";
import {EloConnectorModule} from "../elo/elo-connector";
import {FranchiseModule} from "../franchise";
import {MledbInterfaceModule} from "../mledb/mledb-interface.module";
import {UtilModule} from "../util/util.module";
import {EligibilityService} from "./eligibility";
import {MatchService} from "./match";
import {MatchController} from "./match/match.controller";
import {MatchFranchiseStaffGuard} from "./match/match-franchise-staff.guard";
import {MatchPlayerGuard} from "./match/match.guard";
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
        MatchPlayerGuard,
        MatchFranchiseStaffGuard,
        EligibilityService,
    ],
    exports: [MatchService, RoundService, EligibilityService],
    controllers: [MatchController],
})
export class SchedulingModule {}
