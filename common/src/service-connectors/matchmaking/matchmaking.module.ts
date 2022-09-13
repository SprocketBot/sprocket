import {Module} from "@nestjs/common";

import {GlobalModule} from "../../global.module";
import {UtilModule} from "../../util/util.module";
import {MatchmakingService} from "./matchmaking.service";

@Module({
    providers: [MatchmakingService],
    exports: [MatchmakingService],
    imports: [GlobalModule, UtilModule],
})
export class MatchmakingModule {}
