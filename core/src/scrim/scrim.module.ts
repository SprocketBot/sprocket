import {BullModule} from "@nestjs/bull";
import {Module} from "@nestjs/common";
import {
    EventsModule, MatchmakingModule, RedisModule,
} from "@sprocketbot/common";
import {config} from "@sprocketbot/common/lib/util/config";
import {PubSub} from "apollo-server-express";

import {ConfigurationModule} from "../configuration";
import {DatabaseModule} from "../database";
import {SchedulingModule} from "../database/scheduling";
import {GameModule} from "../game";
import {AuthModule} from "../identity";
import {OrganizationModule} from "../organization";
import {MatchService} from "../scheduling";
import {RoundService} from "../scheduling";
import {ScrimPubSub} from "./constants";
import {ScrimMetricsResolver} from "./metrics";
import {ScrimConsumer} from "./scrim.consumer";
import {ScrimModuleResolver, ScrimModuleResolverPublic} from "./scrim.mod.resolver";
import {ScrimResolver} from "./scrim.resolver";
import {ScrimService} from "./scrim.service";
import {ScrimMetaCrudService} from "./scrim-crud";

@Module({
    imports: [
        ConfigurationModule,
        MatchmakingModule,
        EventsModule,
        GameModule,
        AuthModule,
        RedisModule,
        SchedulingModule,
        MatchmakingModule,
        DatabaseModule,
        OrganizationModule,
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
        BullModule.registerQueue({name: "scrim"}),
    ],
    providers: [
        ScrimModuleResolver,
        ScrimModuleResolverPublic,
        {
            provide: ScrimPubSub,
            useValue: new PubSub(),
        },
        ScrimConsumer,
        ScrimService,
        ScrimResolver,
        MatchService,
        RoundService,
        ScrimMetricsResolver,
        ScrimMetaCrudService,
    ],
    exports: [ScrimService],
})
export class ScrimModule {}
