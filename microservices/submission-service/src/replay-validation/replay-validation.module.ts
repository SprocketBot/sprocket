import {forwardRef, Module} from "@nestjs/common";
import {CoreModule, MatchmakingModule, MinioModule, UtilModule} from "@sprocketbot/common";

import {ReplaySubmissionModule} from "../replay-submission/replay-submission.module";
import {ReplayValidationController} from "./replay-validation.controller";
import {ReplayValidationService} from "./replay-validation.service";

@Module({
    imports: [MatchmakingModule, CoreModule, MinioModule, forwardRef(() => ReplaySubmissionModule), UtilModule],
    providers: [ReplayValidationService],
    exports: [ReplayValidationService],
    controllers: [ReplayValidationController],
})
export class ReplayValidationModule {}
