import {Module} from "@nestjs/common";
import {MatchmakingModule} from "@sprocketbot/common";

import {ReplayValidationService} from "./replay-validation.service";

@Module({
    imports: [MatchmakingModule],
    providers: [ReplayValidationService],
    exports: [ReplayValidationService],
})
export class ReplayValidationModule {}
