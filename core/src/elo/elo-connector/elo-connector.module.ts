import {BullModule} from "@nestjs/bull";
import {Module} from "@nestjs/common";
import {config} from "@sprocketbot/common";

import {EloConnectorConsumer} from "./elo-connector.consumer";
import {EloConnectorService} from "./elo-connector.service";
import {EloBullQueue} from "./elo-connector.types";

@Module({
    imports: [
        BullModule.forRoot({
            redis: {
                host: config.redis.host,
                port: config.redis.port,
                password: config.redis.password,
                tls: config.redis.secure
                    ? {
                          host: config.redis.host,
                          servername: config.redis.host,
                      }
                    : undefined,
                keyPrefix: `${config.redis.prefix}:bull`,
            },
            prefix: `${config.redis.prefix}:bull`,
        }),
        BullModule.registerQueue({name: EloBullQueue}),
    ],
    providers: [EloConnectorService, EloConnectorConsumer],
    exports: [EloConnectorService],
})
export class EloConnectorModule {}
