import {Module} from "@nestjs/common";
import {BullModule} from "@nestjs/bull";

import {GlobalModule, getBullRootConfig} from "@sprocketbot/common";

// Import all 7 service root modules
import {AppModule as CoreModule} from "../../../core/src/app.module";
import {AppModule as DiscordBotModule} from "../../../clients/discord-bot/src/app.module";
import {AppModule as MatchmakingModule} from "../../../microservices/matchmaking-service/src/app.module";
import {AppModule as NotificationModule} from "../../../microservices/notification-service/src/app.module";
import {AppModule as SubmissionModule} from "../../../microservices/submission-service/src/app.module";
import {AppModule as ImageGenerationModule} from "../../../microservices/image-generation-service/src/app.module";
import {AppModule as ServerAnalyticsModule} from "../../../microservices/server-analytics-service/src/app.module";

import {MonolithController} from "./monolith.controller";

@Module({
    imports: [
        // Global infrastructure (must be first)
        GlobalModule,

        // Unified Bull configuration (replaces individual forRoot() calls)
        BullModule.forRoot(getBullRootConfig()),

        // Import all 7 service modules
        CoreModule, // HTTP + RMQ (port 3001, queue: dev-core)
        DiscordBotModule, // RMQ only (queue: dev-bot)
        MatchmakingModule, // RMQ only (queue: dev-matchmaking)
        NotificationModule, // RMQ only (queue: dev-notification)
        SubmissionModule, // RMQ only (queue: dev-submissions)
        ImageGenerationModule, // RMQ only (queue: dev-ig)
        ServerAnalyticsModule, // RMQ only (queue: dev-analytics)
    ],
    controllers: [MonolithController],
})
export class MonolithModule {}
