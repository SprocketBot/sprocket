import {forwardRef, Module} from "@nestjs/common";
import {JwtModule} from "@nestjs/jwt";
import {
    EventsModule, NotificationModule, UtilModule as CommonUtilModule,
} from "@sprocketbot/common";

import {DatabaseModule} from "../database";
import {EloConnectorModule} from "../elo/elo-connector";
import {JwtConstants} from "../identity/auth/oauth/constants";
import {MledbInterfaceModule} from "../mledb";
import {OrganizationModule} from "../organization/organization.module";
import {UtilModule} from "../util/util.module";
import {FranchiseController} from "./franchise/franchise.controller";
import {FranchiseResolver} from "./franchise/franchise.resolver";
import {FranchiseService} from "./franchise/franchise.service";
import {FranchiseProfileResolver} from "./franchise-profile/franchise-profile.resolver";
import {
    GameSkillGroupController, GameSkillGroupResolver, GameSkillGroupService,
} from "./game-skill-group";
import {PlayerService} from "./player";
import {PlayerController} from "./player/player.controller";
import {PlayerResolver} from "./player/player.resolver";
import {TeamService} from "./team/team.service";

@Module({
    imports: [
        DatabaseModule,
        UtilModule,
        NotificationModule,
        EventsModule,
        forwardRef(() => OrganizationModule),
        forwardRef(() => MledbInterfaceModule),
        CommonUtilModule,
        EloConnectorModule,
        JwtModule.register({
            secret: JwtConstants.secret,
        }),
    ],
    providers: [
        PlayerService,
        GameSkillGroupService,
        GameSkillGroupResolver,
        FranchiseService,
        FranchiseResolver,
        FranchiseProfileResolver,
        PlayerResolver,
        TeamService,
    ],
    exports: [
        PlayerService,
        FranchiseService,
        GameSkillGroupService,
        TeamService,
    ],
    controllers: [
        FranchiseController,
        GameSkillGroupController,
        PlayerController,
    ],
})
export class FranchiseModule {}
