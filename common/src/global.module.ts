import {Global, Module} from "@nestjs/common";
import {ClientsModule} from "@nestjs/microservices";

import {CommonClient} from "./global.types";
import {PostgresClientProxy} from "./postgres-transport";
import {config} from "./util/config";

const client = ClientsModule.register([
    {
        name: CommonClient.Analytics,
        customClass: PostgresClientProxy,
        options: {
            queue: config.transport.analytics_queue,
        },
    },
    {
        name: CommonClient.Bot,
        customClass: PostgresClientProxy,
        options: {
            queue: config.transport.bot_queue,
        },
    },
    {
        name: CommonClient.Matchmaking,
        customClass: PostgresClientProxy,
        options: {
            queue: config.transport.matchmaking_queue,
        },
    },
    {
        name: CommonClient.ImageGeneration,
        customClass: PostgresClientProxy,
        options: {
            queue: config.transport.image_generation_queue,
        },
    },
    {
        name: CommonClient.Core,
        customClass: PostgresClientProxy,
        options: {
            queue: config.transport.core_queue,
        },
    },
    {
        name: CommonClient.Submission,
        customClass: PostgresClientProxy,
        options: {
            queue: config.transport.submission_queue,
        },
    },
    {
        name: CommonClient.Notification,
        customClass: PostgresClientProxy,
        options: {
            queue: config.transport.notification_queue,
        },
    },
]);

@Global()
@Module({
    imports: [client],
    exports: [client],
})
export class GlobalModule {}
