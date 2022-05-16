import {Module} from "@nestjs/common";

import {DatabaseModule} from "../database";
import {MledbModule} from "../database/mledb";
import {MledbPlayerService} from "./mledb-player";
import {MledbPlayerAccountService} from "./mledb-player-account";

@Module({
    imports: [
        DatabaseModule,
        MledbModule,
    ],
    providers: [
        MledbPlayerService,
        MledbPlayerAccountService,
    ],
    exports: [
        MledbPlayerService,
        MledbPlayerAccountService,
    ],
})
export class MledbInterfaceModule {}
