import {Query, Resolver} from "@nestjs/graphql";

import {FeatureCode} from "../../database";
import {GameFeatureService} from "./game_feature.service";

@Resolver()
export class GameFeatureResolver {
    constructor(private readonly gameFeatureService: GameFeatureService) {}

    @Query(() => Boolean)
    async getRankoutsEnabled(): Promise<boolean> {
        return this.gameFeatureService.featureIsEnabled(FeatureCode.AUTO_RANKOUTS, 1, 2);
    }

    @Query(() => Boolean)
    async getSalariesEnabled(): Promise<boolean> {
        return this.gameFeatureService.featureIsEnabled(FeatureCode.AUTO_SALARIES, 1, 2);
    }
}
