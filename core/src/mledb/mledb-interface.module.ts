import {Module} from "@nestjs/common";

import {DatabaseModule} from "../database";
import {MledbModule} from "../database/mledb";
import {MledbUserService, MLEDeveloperTeamGuard} from "./mledb-user";

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
