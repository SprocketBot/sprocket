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
import {ScheduleFixtureResolver} from "./schedule-fixture";
import {ScheduleGroupResolver} from "./schedule-group";
import {ScheduleGroupTypeResolver} from "./schedule-group-type";

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
        ScheduleGroupResolver,
        ScheduleGroupTypeResolver,
        ScheduleFixtureResolver,
        MatchResolver,
        MatchParentResolver,
    ],
    exports: [MatchService],
    controllers: [MatchController],
})
export class SchedulingModule {}
