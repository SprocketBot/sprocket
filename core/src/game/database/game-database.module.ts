import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {EnabledFeature} from "./enabled-feature.entity";
import {EnabledFeatureRepository} from "./enabled-feature.repository";
import {Feature} from "./feature.entity";
import {FeatureRepository} from "./feature.repository";
import {Game} from "./game.entity";
import {GameRepository} from "./game.repository";
import {GameFeature} from "./game-feature.entity";
import {GameFeatureRepository} from "./game-feature.repository";
import {GameMode} from "./game-mode.entity";
import {GameModeRepository} from "./game-mode.repository";
import {GamePlatform} from "./game-platform.entity";
import {GamePlatformRepository} from "./game-platform.repository";
import {Platform} from "./platform.entity";
import {PlatformRepository} from "./platform.repository";

const ormModule = TypeOrmModule.forFeature([
    EnabledFeature,
    Feature,
    Game,
    GameFeature,
    GameMode,
    GamePlatform,
    Platform,
]);

const providers = [
    EnabledFeatureRepository,
    FeatureRepository,
    GameRepository,
    GameFeatureRepository,
    GameModeRepository,
    GamePlatformRepository,
    PlatformRepository,
];

@Module({
    imports: [ormModule],
    providers: providers,
    exports: providers,
})
export class GameDatabaseModule {}
