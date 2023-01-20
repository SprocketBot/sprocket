import {forwardRef, Module} from "@nestjs/common";
import {JwtModule} from "@nestjs/jwt";
import {config, EventsModule, NotificationModule} from "@sprocketbot/common";

import {EloConnectorModule} from "../elo/elo-connector";
import {GameDatabaseModule} from "../game/database/game-database.module";
import {IdentityDatabaseModule} from "../identity/database/identity-database.module";
import {MledbInterfaceModule} from "../mledb";
import {OrganizationDatabaseModule} from "../organization/database/organization-database.module";
import {FranchiseDatabaseModule} from "./database/franchise-database.module";
import {FranchiseController} from "./franchise/franchise.controller";
import {FranchiseService} from "./franchise/franchise.service";
import {GameSkillGroupController} from "./game-skill-group/game-skill-group.controller";
import {GameSkillGroupService} from "./game-skill-group/game-skill-group.service";
import {PlayerController} from "./player/player.controller";
import {PlayerService} from "./player/player.service";

@Module({
    imports: [
        JwtModule.register({
            secret: config.auth.jwt.secret,
        }),
        EventsModule,
        NotificationModule,
        forwardRef(() => MledbInterfaceModule),
        EloConnectorModule,
        FranchiseDatabaseModule,
        IdentityDatabaseModule,
        OrganizationDatabaseModule,
        GameDatabaseModule,
    ],
    controllers: [FranchiseController, GameSkillGroupController, PlayerController],
    providers: [FranchiseService, GameSkillGroupService, PlayerService],
    exports: [PlayerService, FranchiseService],
})
export class FranchiseModule {}
