import {
    InjectQueue, OnQueueFailed, Process, Processor,
} from "@nestjs/bull";
import {Logger} from "@nestjs/common";
import {AnalyticsEndpoint, AnalyticsService} from "@sprocketbot/common";
import {Job, Queue} from "bull";
import {previousMonday} from "date-fns";

import {FeatureCode} from "$db/game/feature/feature.enum";

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
        private readonly analyticsService: AnalyticsService,
    ) {}

    @OnQueueFailed()
    async onFailure(job: Job, error: Error): Promise<void> {
        this.logger.error(error);

        await this.analyticsService.send(AnalyticsEndpoint.Analytics, {
            name: "weekly_salaries_job",
            tags: [
                ["status", "failed"],
                ["job_name", job.name],
            ],
            strings: [
                ["error_message", error.message],
            ],
        });
    }

    @Process({name: WEEKLY_SALARIES_JOB_NAME})
    async runSalaries(): Promise<void> {
        const startTime = Date.now();
        this.logger.log("Starting weekly salaries job");

        const rocketLeague = await this.gameService.getGameByTitle("Rocket League");
        const mleOrg = await this.organizationService.getOrganization({where: {name: "Minor League Esports"}, relations: {organization: true} });

        const autoRankoutsEnabled = await this.gameFeatureService.featureIsEnabled(FeatureCode.AUTO_RANKOUTS, rocketLeague.id, mleOrg.id);
        const autoSalariesEnabled = await this.gameFeatureService.featureIsEnabled(FeatureCode.AUTO_SALARIES, rocketLeague.id, mleOrg.id);

        this.logger.log(`Feature flags: autoSalariesEnabled=${autoSalariesEnabled}, autoRankoutsEnabled=${autoRankoutsEnabled}`);

        if (!autoSalariesEnabled) {
            this.logger.log("Auto salaries disabled, skipping job");
            await this.analyticsService.send(AnalyticsEndpoint.Analytics, {
                name: "weekly_salaries_job",
                tags: [ ["status", "skipped"], ["reason", "feature_disabled"] ],
                booleans: [ ["auto_salaries_enabled", false] ],
            });
            return;
        }

        this.logger.log(`Requesting salary calculation from ELO service (doRankouts=${autoRankoutsEnabled})`);
        const salaryData = await this.eloConnectorService.createJobAndWait(EloEndpoint.CalculateSalaries, {doRankouts: autoRankoutsEnabled});

        this.logger.log("Salary calculation received, saving salaries");
        await this.playerService.saveSalaries(salaryData);

        const duration = Date.now() - startTime;
        this.logger.log(`Weekly salaries job completed in ${duration}ms`);

        const totalPlayers = salaryData.flat().length;
        const playersWithRankouts = salaryData.flat().filter(p => p.rankout).length;

        await this.analyticsService.send(AnalyticsEndpoint.Analytics, {
            name: "weekly_salaries_job",
            tags: [ ["status", "completed"] ],
            booleans: [
                ["auto_salaries_enabled", true],
                ["auto_rankouts_enabled", autoRankoutsEnabled],
            ],
            ints: [
                ["duration_ms", duration],
                ["total_players", totalPlayers],
                ["players_with_rankouts", playersWithRankouts],
                ["players_without_rankouts", totalPlayers - playersWithRankouts],
            ],
        });
    }

    async compactGraph(): Promise<void> {
        this.logger.debug("Compacting the elo graph");

        await this.eloConnectorService.createJobAndWait(EloEndpoint.CompactGraph, {});
    }

    async onApplicationBootstrap(): Promise<void> {
        const repeatableJobs = await this.eloQueue.getRepeatableJobs();

        if (!repeatableJobs.some(job => job.name === WEEKLY_SALARIES_JOB_NAME)) {
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
