import {forwardRef, Module} from "@nestjs/common";

import {DatabaseModule} from "../database";
import {OrganizationModule} from "../organization";
import {GameSkillGroupService} from "./game-skill-group";
import {PlayerService} from "./player";

@Module({
    imports: [
        DatabaseModule,
        forwardRef(() => OrganizationModule),
    ],
    providers: [
        PlayerService,
        GameSkillGroupService,
    ],
    exports: [
        PlayerService,
        GameSkillGroupService,
    ],
})
export class FranchiseModule {}
