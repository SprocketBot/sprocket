import {Module} from "@nestjs/common";
import {
    BotModule,
    CoreModule,
    EventsModule,
    MatchmakingModule,
    SubmissionModule as CommonSubmissionModule,
} from "@sprocketbot/common";

import {SubmissionService} from "./submission.service";

@Module({
    imports: [EventsModule, BotModule, CoreModule, CommonSubmissionModule, MatchmakingModule],
    providers: [SubmissionService],
})
export class SubmissionModule {}
