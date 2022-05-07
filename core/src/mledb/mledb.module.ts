import {Module} from "@nestjs/common";
import { DatabaseModule } from "src/database";

import {MledbUserService} from "./mledb-user/mledb-user.service";
import { TypeOrmModule } from "@nestjs/typeorm"; 
import { MLE_Player } from "src/database/mledb/Player.model";
@Module({
    imports: [
        DatabaseModule,
        TypeOrmModule.forFeature([MLE_Player,])
    ],
    providers: [MledbUserService],
    exports: [MledbUserService],
})
export class MledbModule {}
