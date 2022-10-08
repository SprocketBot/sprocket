import {InjectQueue, OnQueueFailed, Process, Processor} from "@nestjs/bull";
import {Logger} from "@nestjs/common";
import {Job, Queue} from "bull";
import {previousMonday} from "date-fns";

import {FeatureCode} from "../database";
import {PlayerService} from "../franchise";
import {GameFeatureService, GameService} from "../game";
import {OrganizationService} from "../organization";
import {EloConnectorService, EloEndpoint} from "./elo-connector";

export const WEEKLY_SALARIES_JOB_NAME = "weeklySalaries";

export const CORE_WEEKLY_SALARIES_QUEUE = "coreweeklysalaries";

@Processor(CORE_WEEKLY_SALARIES_QUEUE)
export class EloConsumer {
    private readonly logger = new Logger(EloConsumer.name);

    constructor(
        @InjectQueue(CORE_WEEKLY_SALARIES_QUEUE) private eloQueue: Queue,
        private readonly playerService: PlayerService,
        private readonly gameService: GameService,
        private readonly gameFeatureService: GameFeatureService,
        private readonly organizationService: OrganizationService,
        private readonly eloConnectorService: EloConnectorService,
    ) {}

    @OnQueueFailed()
    async onFailure(_: Job, error: Error): Promise<void> {
        this.logger.error(error);
    }

    @Process({name: WEEKLY_SALARIES_JOB_NAME})
    async runSalaries(): Promise<void> {
        this.logger.debug("Running weekly salaries!");

        const rocketLeague = await this.gameService.getGameByTitle(
            "Rocket League",
        );
        const mleOrg = await this.organizationService.getOrganization({
            where: {name: "Minor League Esports"},
            relations: {organization: true},
        });

        const autoRankoutsEnabled =
            await this.gameFeatureService.featureIsEnabled(
                FeatureCode.AUTO_RANKOUTS,
                rocketLeague.id,
                mleOrg.id,
            );
        const autoSalariesEnabled =
            await this.gameFeatureService.featureIsEnabled(
                FeatureCode.AUTO_SALARIES,
                rocketLeague.id,
                mleOrg.id,
            );

        if (!autoSalariesEnabled) return;

        const salaryData = await this.eloConnectorService.createJobAndWait(
            EloEndpoint.CalculateSalaries,
            {doRankouts: autoRankoutsEnabled},
        );
        await this.playerService.saveSalaries(salaryData);
    }

    async onApplicationBootstrap(): Promise<void> {
        const repeatableJobs = await this.eloQueue.getRepeatableJobs();

        if (
            !repeatableJobs.some(job => job.name === WEEKLY_SALARIES_JOB_NAME)
        ) {
            this.logger.debug("Found no job for weekly salaries, creating");

            await this.eloQueue.add(WEEKLY_SALARIES_JOB_NAME, null, {
                repeat: {
                    cron: "0 12 * * 1",
                    startDate: previousMonday(new Date()),
                    tz: "America/New_York",
                },
            });
        } else {
            this.logger.debug("Job for weekly salaries already exists");
        }
    }
}
