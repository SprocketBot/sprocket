import {Module} from "@nestjs/common";
import {
    EventsModule, MatchmakingModule, RedisModule,
} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";

import {DatabaseModule} from "../database";
import {SchedulingModule} from "../database/scheduling/scheduling.module";
import {GameModule} from "../game/game.module";
import {AuthModule} from "../identity/auth/auth.module";
import {OrganizationModule} from "../organization/organization.module";
import {MatchService} from "../scheduling/match/match.service";
import {RoundService} from "../scheduling/round/round.service";
import {ScrimPubSub} from "./constants";
import {ScrimMetricsResolver} from "./metrics/scrim-metrics.resolver";
import {ScrimModuleResolver, ScrimModuleResolverPublic} from "./scrim.mod.resolver";
import {ScrimResolver} from "./scrim.resolver";
import {ScrimService} from "./scrim.service";
import {ScrimMetaCrudService} from "./scrim-crud/scrim-crud.service";

@Module({
    imports: [MatchmakingModule, EventsModule, GameModule, AuthModule, RedisModule, SchedulingModule, MatchmakingModule, DatabaseModule, OrganizationModule],
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
