import {Module} from "@nestjs/common";

import {DatabaseModule} from "../database";
import {GameSkillGroupService} from "./game-skill-group";
import {PlayerService} from "./player";

@Module({
    imports: [
        DatabaseModule,
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
