import {Module} from "@nestjs/common";
import {
    EventsModule, MatchmakingModule, RedisModule,
} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";

import {DatabaseModule, SchedulingModule} from "../database";
import {GameModule} from "../game";
import {AuthModule} from "../identity";
import {MatchService, RoundService} from "../scheduling";
import {ScrimPubSub} from "./constants";
import {ScrimMetricsResolver} from "./metrics";
import {ScrimModuleResolver, ScrimModuleResolverPublic} from "./scrim.mod.resolver";
import {ScrimResolver} from "./scrim.resolver";
import {ScrimService} from "./scrim.service";
import {ScrimMetaCrudService} from "./scrim-crud";

@Module({
    imports: [MatchmakingModule, EventsModule, GameModule, AuthModule, RedisModule, SchedulingModule, MatchmakingModule, DatabaseModule],
    providers: [
        ScrimModuleResolver,
        ScrimModuleResolverPublic,
        {
            provide: ScrimPubSub,
            useValue: new PubSub(),
        },
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
