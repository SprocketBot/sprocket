import {Module} from "@nestjs/common";
import {
    BotModule, CoreModule, EventsModule, MatchmakingModule, RedisModule,
} from "@sprocketbot/common";

import {SubmissionEventSubscriber} from "./submission.event-subscriber";
import {SubmissionService} from "./submission.service";

@Module({
    imports: [
        EventsModule,
        BotModule,
        CoreModule,
        RedisModule,
        MatchmakingModule,
    ],
    providers: [
        SubmissionService,
        SubmissionEventSubscriber,
    ],
})
export class SubmissionModule {}
