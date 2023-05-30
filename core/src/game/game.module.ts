import {Module} from "@nestjs/common";

import {FranchiseDatabaseModule} from "../franchise/database/franchise-database.module";
import {GameSkillGroupConverter} from "../franchise/graphql/game-skill-group.converter";
import {OrganizationDatabaseModule} from "../organization/database/organization-database.module";
import {UtilModule} from "../util";
import {GameDatabaseModule} from "./database/game-database.module";
import {GameController} from "./game/game.controller";
import {GameResolver} from "./game/game.resolver";
import {GameFeatureService} from "./game-feature/game-feature.service";
import {GameModeController} from "./game-mode/game-mode.controller";
import {GameConverter} from "./graphql/game.converter";

@Module({
    imports: [GameDatabaseModule, OrganizationDatabaseModule, FranchiseDatabaseModule, UtilModule],
    controllers: [GameController, GameModeController],
    providers: [GameFeatureService, GameResolver, GameConverter, GameSkillGroupConverter],
})
export class GameModule {}
