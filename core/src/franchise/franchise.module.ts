import {forwardRef, Module} from "@nestjs/common";

import {DatabaseModule} from "../database";
import {OrganizationModule} from "../organization/organization.module";
import {UtilModule} from "../util/util.module";
import {FranchiseController} from "./franchise/franchise.controller";
import {FranchiseResolver} from "./franchise/franchise.resolver";
import {FranchiseService} from "./franchise/franchise.service";
import {
    GameSkillGroupController, GameSkillGroupResolver, GameSkillGroupService,
} from "./game-skill-group";
import {PlayerService} from "./player";

@Module({
    imports: [
        DatabaseModule,
        UtilModule,
        forwardRef(() => OrganizationModule),
    ],
    providers: [
        PlayerService,
        GameSkillGroupService,
        GameSkillGroupResolver,
        FranchiseService,
        FranchiseResolver,
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
