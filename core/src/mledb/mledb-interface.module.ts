import {Module} from "@nestjs/common";
import {MatchmakingModule} from "@sprocketbot/common";

import {DatabaseModule} from "../database";
import {MledbModule} from "../database/mledb";
import {FranchiseModule} from "../franchise";
import {GameModule} from "../game";
import {MledbPlayerService} from "./mledb-player";
import {MledbPlayerAccountService} from "./mledb-player-account";
import {MledbScrimService} from "./mledb-scrim/mledb-scrim.service";

@Module({
    imports: [
        DatabaseModule,
        MledbModule,
        FranchiseModule,
        GameModule,
        MatchmakingModule,
    ],
    providers: [
        MledbPlayerService,
        MledbPlayerAccountService,
        MledbScrimService,
    ],
    exports: [
        MledbPlayerService,
        MledbPlayerAccountService,
        MledbScrimService,
    ],
})
export class MledbInterfaceModule {
}
