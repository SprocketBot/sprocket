import {BullModule} from "@nestjs/bull";
import {Module} from "@nestjs/common";
import {config} from "@sprocketbot/common";

import {EloConnectorService} from "./elo-connector.service";

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
            },
        }),
    ],
    providers: [EloConnectorService],
    exports: [EloConnectorService],
})
export class EloConnectorModule {}
