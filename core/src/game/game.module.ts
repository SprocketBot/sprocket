import {Module} from "@nestjs/common";

import {UtilModule} from "$util";

import {DatabaseModule} from "../database";
import {GameResolver} from "./game";
import {GameController} from "./game/game.controller";
import {GameFeatureResolver} from "./game-feature";
import {GameFeatureService} from "./game-feature/game-feature.service";
import {GameModeResolver} from "./game-mode";
import {GameModeController} from "./game-mode/game-mode.controller";

@Module({
    imports: [DatabaseModule],
    providers: [
        GameService,
        GameModeService,
        PlatformService,
        GameResolver,
        GameModeResolver,
        GameFeatureService,
        GameFeatureResolver,
    ],
    controllers: [
        GameController,
        GameModeController,
    ],
    exports: [PlatformService, GameModeService, GameService, GameFeatureService],
})
export class GameModule {}
