import {BullModule} from "@nestjs/bull";
import {Module} from "@nestjs/common";
import {
    config,
    EventsModule, MatchmakingModule, RedisModule,
} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";

import {ConfigurationModule} from "../configuration";
import {DatabaseModule} from "../database";
import {SchedulingModule} from "../database/scheduling";
import {FranchiseModule} from "../franchise";
import {GameModule} from "../game";
import {AuthModule} from "../identity";
import {OrganizationModule} from "../organization";
import {MatchService, RoundService} from "../scheduling";
import {ScrimPubSub} from "./constants";
import {ScrimMetricsResolver} from "./metrics";
import {ScrimConsumer} from "./scrim.consumer";
import {ScrimModuleResolver, ScrimModuleResolverPublic} from "./scrim.mod.resolver";
import {ScrimResolver} from "./scrim.resolver";
import {ScrimService} from "./scrim.service";
import {ScrimMetaCrudService} from "./scrim-crud";
import { Scrim.ManagementResolver } from './scrim.management/scrim.management.resolver';

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
        FranchiseModule,
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
        Scrim.ManagementResolver,
    ],
    exports: [ScrimService],
})
export class ScrimModule {}
