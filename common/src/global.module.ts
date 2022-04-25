import {Global, Module} from "@nestjs/common";
import {ClientsModule, Transport} from "@nestjs/microservices";

import {CommonClient} from "./global.types";
import {config} from "./util/config";

const client = ClientsModule.register([
    {
        name: CommonClient.Analytics,
        transport: Transport.RMQ,
        options: {
            urls: [config.transport.url] as string[],
            queue: config.transport.analytics_queue,
            queueOptions: {
                durable: true,
            },
            socketOptions: {
                heartbeat: 120,
            },
        },
    },
    {
        name: CommonClient.Bot,
        transport: Transport.RMQ,
        options: {
            urls: [config.transport.url] as string[],
            queue: config.transport.bot_queue,
            queueOptions: {
                durable: true,
            },
            socketOptions: {
                heartbeat: 120,
            },
        },
    },
    {
        name: CommonClient.Matchmaking,
        transport: Transport.RMQ,
        options: {
            urls: [config.transport.url] as string[],
            queue: config.transport.matchmaking_queue,
            queueOptions: {
                durable: true,
            },
            socketOptions: {
                heartbeat: 120,
            },
        },
    },
]);

@Global()
@Module({
    imports: [client],
    exports: [client],
    providers: [],
})
export class GlobalModule {}
