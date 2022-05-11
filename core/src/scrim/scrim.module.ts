import {BullModule} from "@nestjs/bull";
import {Module} from "@nestjs/common";
import {
    EventsModule, MatchmakingModule, RedisModule,
} from "@sprocketbot/common";
import {config} from "@sprocketbot/common/lib/util/config";
import {PubSub} from "apollo-server-express";

import {ConfigurationModule} from "../configuration/configuration.module";
import {DatabaseModule} from "../database";
import {SchedulingModule} from "../database/scheduling/scheduling.module";
import {GameModule} from "../game/game.module";
import {AuthModule} from "../identity/auth/auth.module";
import {OrganizationModule} from "../organization/organization.module";
import {MatchService} from "../scheduling/match/match.service";
import {RoundService} from "../scheduling/round/round.service";
import {ScrimPubSub} from "./constants";
import {ScrimMetricsResolver} from "./metrics/scrim-metrics.resolver";
import {ScrimConsumer} from "./scrim.consumer";
import {ScrimModuleResolver, ScrimModuleResolverPublic} from "./scrim.mod.resolver";
import {ScrimResolver} from "./scrim.resolver";
import {ScrimService} from "./scrim.service";
import {ScrimMetaCrudService} from "./scrim-crud/scrim-crud.service";

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
