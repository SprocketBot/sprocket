import {Module} from "@nestjs/common";

import {AppModule as DiscordBotModule} from "../../../clients/discord-bot/src/app.module";
import {AppModule as CoreModule} from "../../../core/src/app.module";
import {AppModule as ImageGenerationModule} from "../../../microservices/image-generation-service/src/app.module";
import {AppModule as MatchmakingModule} from "../../../microservices/matchmaking-service/src/app.module";
import {AppModule as NotificationModule} from "../../../microservices/notification-service/src/app.module";
import {AppModule as ServerAnalyticsModule} from "../../../microservices/server-analytics-service/src/app.module";
import {AppModule as SubmissionModule} from "../../../microservices/submission-service/src/app.module";
import {MonolithController} from "./monolith.controller";

@Module({
    imports: [
        CoreModule,
        DiscordBotModule,
        MatchmakingModule,
        NotificationModule,
        SubmissionModule,
        ImageGenerationModule,
        ServerAnalyticsModule,
    ],
    controllers: [MonolithController],
})
export class MonolithModule {}
