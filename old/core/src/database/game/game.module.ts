import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {EnabledFeature} from "./enabled_feature";
import {Feature} from "./feature";
import {Game} from "./game";
import {GameFeature} from "./game_feature";
import {GameMode} from "./game_mode";
import {Platform} from "./platform";

export const gameEntities = [
    EnabledFeature,
    Feature,
    Platform,
    GameMode,
    Game,
    GameFeature,
    Feature,
];

const ormModule = TypeOrmModule.forFeature(gameEntities);

@Module({
    imports: [
        ormModule,
    ],
    exports: [
        ormModule,
    ],
})
export class GameModule {}
