import {Module} from "@nestjs/common";

import {DatabaseModule} from "../database";
import {GameResolver, GameService} from "./game";
import {GameModeService} from "./game-mode";
import {PlatformService} from "./platform";

@Module({
    imports: [DatabaseModule],
    providers: [GameService, GameModeService, PlatformService, GameResolver],
    controllers: [],
    exports: [PlatformService, GameModeService],
})
export class GameModule {}
