import {Module} from "@nestjs/common";
import {JwtModule} from "@nestjs/jwt";
import {config, EventsModule, NotificationModule} from "@sprocketbot/common";

import {IdentityDatabaseModule} from "../identity/database/identity-database.module";
import {MledbInterfaceModule} from "../mledb";
import {FranchiseDatabaseModule} from "./database/franchise-database.module";
import {FranchiseController} from "./franchise.controller";
import {FranchiseService} from "./franchise.service";
import {GameSkillGroupController} from "./game-skill-group.controller";
import {GameSkillGroupService} from "./game-skill-group.service";

@Module({
    imports: [
        JwtModule.register({
            secret: config.auth.jwt.secret,
        }),
        MledbInterfaceModule,
        EventsModule,
        NotificationModule,
        FranchiseDatabaseModule,
        IdentityDatabaseModule,
    ],
    controllers: [FranchiseController, GameSkillGroupController],
    providers: [FranchiseService, GameSkillGroupService],
})
export class FranchiseModule {}
