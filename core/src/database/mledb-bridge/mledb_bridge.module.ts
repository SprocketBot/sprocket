import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {PlayerToUser} from "./player_to_user.model";

export const bridgeEntities = [
    PlayerToUser,
];

const ormModule = TypeOrmModule.forFeature(bridgeEntities);

@Module({
    imports: [
        ormModule,
    ],
    exports: [
        ormModule,
    ],
})
export class MledbBridgeModule {}
