import {Module} from "@nestjs/common";

import {DatabaseModule} from "../database";
import {GameResolver, GameService} from "./game";
import {GameController} from "./game/game.controller";
import {GameFeatureResolver} from "./game_feature";
import {GameFeatureService} from "./game_feature/game_feature.service";
import {GameModeResolver, GameModeService} from "./game-mode";
import {PlatformService} from "./platform";

@Module({
    imports: [
        DatabaseModule,
    ],
    providers: [
        GameService,
        GameModeService,
        PlatformService,
        GameResolver,
        GameModeResolver,
        GameFeatureService,
        GameFeatureResolver,
    ],
    controllers: [GameController],
    exports: [PlatformService, GameModeService, GameService, GameFeatureService],
})
export class GameModule {}
