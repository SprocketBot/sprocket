import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {DatabaseModule} from "../database";
import {MLE_Player} from "../database/mledb/Player.model";
import {MLE_PlayerToOrg} from "../database/mledb/PlayerToOrg.model";
import {MLEDeveloperTeamGuard} from "./mledb-user/mle-organization-team.guard";
import {MledbUserService} from "./mledb-user/mledb-user.service";

@Module({
    imports: [
        DatabaseModule,
        TypeOrmModule.forFeature([
            MLE_Player,
            MLE_PlayerToOrg,
        ]),
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
