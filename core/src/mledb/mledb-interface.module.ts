import {Module} from "@nestjs/common";

import {DatabaseModule} from "../database";
import {MledbModule} from "../database/mledb";
import {MledbPlayerService, MLEDeveloperTeamGuard} from "./mledb-player";
import {MledbPlayerAccountService} from "./mledb-player-account";

@Module({
    imports: [
        DatabaseModule,
        MledbModule,
    ],
    providers: [
        MledbPlayerService,
        MledbPlayerAccountService,
        MLEDeveloperTeamGuard,
    ],
    exports: [
        MledbPlayerService,
        MledbPlayerAccountService,
        MLEDeveloperTeamGuard,
    ],
})
export class MledbInterfaceModule {}
