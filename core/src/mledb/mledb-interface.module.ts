import {forwardRef, Module} from "@nestjs/common";
import {MatchmakingModule} from "@sprocketbot/common";

import {DatabaseModule} from "../database";
import {FranchiseModule} from "../franchise";
import {GameModule} from "../game";
import {IdentityModule} from "../identity";
import {SprocketRatingModule} from "../sprocket-rating";
import {MledbPlayerService} from "./mledb-player";
import {MledbPlayerAccountService} from "./mledb-player-account";
import {MledbScrimService} from "./mledb-scrim";

@Module({
    imports: [
        DatabaseModule,
        GameModule,
        MatchmakingModule,
        SprocketRatingModule,
        forwardRef(() => FranchiseModule),
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
