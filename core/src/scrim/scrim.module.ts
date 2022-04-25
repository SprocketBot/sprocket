import {Module} from "@nestjs/common";
import {
    EventsModule, MatchmakingModule, RedisModule,
} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";
import {MatchService} from "src/scheduling/match/match.service";
import {RoundService} from "src/scheduling/round/round.service";

import {DatabaseModule} from "../database";
import {SchedulingModule} from "../database/scheduling/scheduling.module";
import {GameModule} from "../game/game.module";
import {AuthModule} from "../identity/auth/auth.module";
import {ScrimPubSub} from "./constants";
import {ScrimMetricsResolver} from "./metrics/scrim-metrics.resolver";
import {ScrimModuleResolver, ScrimModuleResolverPublic} from "./scrim.mod.resolver";
import {ScrimResolver} from "./scrim.resolver";
import {ScrimService} from "./scrim.service";
import {ScrimMetaCrudService} from "./scrim-crud/scrim-crud.service";

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
