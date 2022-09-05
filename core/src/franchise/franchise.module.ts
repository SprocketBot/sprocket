import {forwardRef, Module} from "@nestjs/common";
import {
    EventsModule, NotificationModule, UtilModule as CommonUtilModule,
} from "@sprocketbot/common";

import {DatabaseModule} from "../database";
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
import {PlayerResolver} from "./player/player.resolver";

@Module({
    imports: [
        DatabaseModule,
        UtilModule,
        NotificationModule,
        EventsModule,
        forwardRef(() => OrganizationModule),
        forwardRef(() => MledbInterfaceModule),
        CommonUtilModule,
    ],
    providers: [
        PlayerService,
        GameSkillGroupService,
        GameSkillGroupResolver,
        FranchiseService,
        FranchiseResolver,
        FranchiseProfileResolver,
        PlayerResolver,
    ],
    exports: [
        PlayerService,
        FranchiseService,
        GameSkillGroupService,
    ],
    controllers: [
        FranchiseController,
        GameSkillGroupController,
    ],
})
export class FranchiseModule {}
