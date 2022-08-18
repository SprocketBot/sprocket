import {Process, Processor} from "@nestjs/bull";
import {Logger} from "@nestjs/common";

import {FeatureCode} from "../database";
import {GameFeatureService, GameService} from "../game";
import {OrganizationService} from "../organization";
import {EloService} from "./elo.service";
import {
    EloBullQueue, EloConnectorService, EloEndpoint,
} from "./elo-connector";

export const WEEKLY_SALARIES_JOB_NAME = "weeklySalaries";

@Processor(EloBullQueue)
export class EloConsumer {
    private readonly logger = new Logger(EloConsumer.name);

    constructor(
        private readonly eloService: EloService,
        private readonly gameService: GameService,
        private readonly gameFeatureService: GameFeatureService,
        private readonly organizationService: OrganizationService,
        private readonly eloConnectorService: EloConnectorService,
    ) {}

    @Process({name: WEEKLY_SALARIES_JOB_NAME})
    async runSalaries(): Promise<void> {
        this.logger.debug("Running weekly salaries!");

        // const games = await this.gameService.getGames();
        // const organizations = await this.organizationService.getOrganizations();

        // await Promise.all(organizations.map(async organization => Promise.all(games.map(async game => {
        //     const autoRankoutsEnabled = await this.gameFeatureService.featureIsEnabled(FeatureCode.AUTO_RANKOUTS, game.id, organization.id);
        //     const autoSalariesEnabled = await this.gameFeatureService.featureIsEnabled(FeatureCode.AUTO_SALARIES, game.id, organization.id);

        //     if (autoRankoutsEnabled) {
        //         // TODO: Scope to Org/Game
        //         await this.eloService.processSalaries(true);
        //     } else if (autoSalariesEnabled) {
        //         // TODO: Scope to Org/Game
        //         await this.eloService.processSalaries(false);
        //     }
        // }))));

        const rocketLeague = await this.gameService.getGameByTitle("Rocket League");
        const mleOrg = await this.organizationService.getOrganization({where: {name: "Minor League Esports"} });

        const autoRankoutsEnabled = await this.gameFeatureService.featureIsEnabled(FeatureCode.AUTO_RANKOUTS, rocketLeague.id, mleOrg.id);
        const autoSalariesEnabled = await this.gameFeatureService.featureIsEnabled(FeatureCode.AUTO_SALARIES, rocketLeague.id, mleOrg.id);

        if (autoRankoutsEnabled) {
            await this.eloConnectorService.createJob(EloEndpoint.CalculateSalaries, {doRankouts: true});
        } else if (autoSalariesEnabled) {
            await this.eloConnectorService.createJob(EloEndpoint.CalculateSalaries, {doRankouts: false});
        }
    }
}
