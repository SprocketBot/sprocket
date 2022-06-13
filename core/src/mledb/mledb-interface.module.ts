import {forwardRef, Module} from "@nestjs/common";
import {MatchmakingModule} from "@sprocketbot/common";

import {DatabaseModule} from "../database";
import {MledbModule} from "../database/mledb";
import {FranchiseModule} from "../franchise";
import {GameModule} from "../game";
import {IdentityModule} from "../identity/identity.module";
import {SprocketRatingModule} from "../sprocket-rating/sprocket-rating.module";
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
        SprocketRatingModule,
        forwardRef(() => IdentityModule),
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
