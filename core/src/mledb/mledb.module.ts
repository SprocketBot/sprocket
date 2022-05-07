import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {DatabaseModule} from "src/database";
import {MLE_Player} from "src/database/mledb/Player.model";
import {MLE_PlayerToOrg} from "src/database/mledb/PlayerToOrg.model";

import {MledbUserService} from "./mledb-user/mledb-user.service";
@Module({
    imports: [
        DatabaseModule,
        TypeOrmModule.forFeature([
            MLE_Player,
            MLE_PlayerToOrg,
        ]),
    ],
    providers: [MledbUserService],
    exports: [MledbUserService],
})
export class MledbModule {}
