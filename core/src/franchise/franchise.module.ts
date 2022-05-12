import {Module} from "@nestjs/common";

import {DatabaseModule} from "../database";
import {PlayerService} from "./player/player.service";

@Module({
    imports: [
        DatabaseModule,
    ],
    providers: [PlayerService],
    exports: [PlayerService],
})
export class FranchiseModule {}
