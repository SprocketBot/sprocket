import {Module} from "@nestjs/common";

import {OrganizationDatabaseModule} from "../organization/database/organization-database.module";
import {GameDatabaseModule} from "./database/game-database.module";
import {GameController} from "./game/game.controller";
import {GameFeatureService} from "./game-feature/game-feature.service";
import {GameModeController} from "./game-mode/game-mode.controller";

@Module({
    imports: [GameDatabaseModule, OrganizationDatabaseModule],
    controllers: [GameController, GameModeController],
    providers: [GameFeatureService],
})
export class GameModule {}
