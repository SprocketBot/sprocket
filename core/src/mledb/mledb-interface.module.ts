import {Module} from "@nestjs/common";

import {DatabaseModule} from "../database";
import {MledbModule} from "../database/mledb";
import {MLEDeveloperTeamGuard} from "./mledb-user/mle-organization-team.guard";
import {MledbUserService} from "./mledb-user/mledb-user.service";

@Module({
    imports: [
        DatabaseModule,
        MledbModule,
    ],
    providers: [
        MledbUserService,
        MLEDeveloperTeamGuard,
    ],
    exports: [
        MledbUserService,
        MLEDeveloperTeamGuard,
    ],
})
export class MledbInterfaceModule {}
