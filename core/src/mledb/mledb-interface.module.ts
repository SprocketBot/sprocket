import {forwardRef, Module} from "@nestjs/common";
import {MatchmakingModule} from "@sprocketbot/common";

import {DatabaseModule} from "../database";
import {FranchiseModule} from "../franchise";
import {GameModule} from "../game";
import {IdentityModule} from "../identity";
import {OrganizationModule} from "../organization";
import {SprocketRatingModule} from "../sprocket-rating";
import {MledbPlayerService} from "./mledb-player";
import {MledbPlayerController} from "./mledb-player/mledb-player.controller";
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
        forwardRef(() => OrganizationModule),
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
    controllers: [MledbPlayerController],
})
export class MledbInterfaceModule {
}
