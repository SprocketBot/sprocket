import {
    OnGlobalQueueCompleted, Process, Processor,
} from "@nestjs/bull";
import {Logger} from "@nestjs/common";
import {Job} from "bull";

import {FeatureCode} from "../database";
import {GameFeatureService, GameService} from "../game";
import {OrganizationService} from "../organization";
import {EloConnectorService} from "./elo-connector.service";

export const WEEKLY_SALARIES_JOB_NAME = "weeklySalaries";
export const RUN_SALARIES_JOB_NAME = "salaries";

@Processor("elo")
export class EloConsumer {
    private readonly logger = new Logger(EloConsumer.name);

    constructor(
        private readonly eloService: EloConnectorService,
        private readonly gameService: GameService,
        private readonly gameFeatureService: GameFeatureService,
        private readonly organizationService: OrganizationService,
    ) {}

    /* eslint-disable */
    @OnGlobalQueueCompleted()
    async onCompleted(job: Job, result: any): Promise<void> {
        if (job.name === RUN_SALARIES_JOB_NAME) {
            try {
                const resObj = JSON.parse(result);
                this.logger.verbose(`Job ${JSON.stringify(job)} completed with result: ${result}, and ${JSON.stringify(resObj)}`);
                if (resObj.jobType) {
                    this.logger.verbose(`Salary job finished, processing on postgres side now. `);
                    await this.eloService.saveSalaries(resObj.data);
                }
            } catch (e) {
                this.logger.error(e);
            }
        }
    }
    /* eslint-enable */

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
            await this.eloService.processSalaries(true);
        } else if (autoSalariesEnabled) {
            await this.eloService.processSalaries(false);
        }
    }
}
