import {Module} from "@nestjs/common";

import {DatabaseModule} from "../database";
import {GameResolver} from "./game/game.resolver";
import {GameService} from "./game/game.service";
import {GameModeService} from "./game-mode/game-mode.service";
import {PlatformService} from "./platform/platform.service";

@Module({
    imports: [DatabaseModule],
    providers: [GameService, GameModeService, PlatformService, GameResolver],
    controllers: [],
    exports: [PlatformService, GameModeService],
})
export class GameModule {}
