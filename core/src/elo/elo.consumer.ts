import type {OnApplicationBootstrap, OnModuleDestroy} from "@nestjs/common";
import {Injectable, Logger} from "@nestjs/common";
import {
    AnalyticsEndpoint, AnalyticsService, PostgresService,
} from "@sprocketbot/common";

import {FeatureCode} from "$db/game/feature/feature.enum";

import {PlayerService} from "../franchise";
import {GameFeatureService, GameService} from "../game";
import {OrganizationService} from "../organization";
import {EloConnectorService, EloEndpoint} from "./elo-connector";

export const WEEKLY_SALARIES_JOB_NAME = "weeklySalaries";

// Configurable via WEEKLY_SALARIES_INTERVAL_MS env var (default: 1 hour)
const WEEKLY_SALARIES_INTERVAL_MS = Number.parseInt(process.env.WEEKLY_SALARIES_INTERVAL_MS || "3600000");

@Injectable()
export class EloConsumer implements OnApplicationBootstrap, OnModuleDestroy {
    private readonly logger = new Logger(EloConsumer.name);

    private interval?: ReturnType<typeof setInterval>;

    constructor(
        private readonly playerService: PlayerService,
        private readonly gameService: GameService,
        private readonly gameFeatureService: GameFeatureService,
        private readonly organizationService: OrganizationService,
        private readonly eloConnectorService: EloConnectorService,
        private readonly analyticsService: AnalyticsService,
        private readonly postgres: PostgresService,
    ) {}

    async runSalaries(): Promise<void> {
        const startTime = Date.now();
        this.logger.log("Starting weekly salaries job");

        const rocketLeague = await this.gameService.getGameByTitle("Rocket League");
        const mleOrg = await this.organizationService.getOrganization({
            where: {name: "Minor League Esports"},
            relations: {organization: true},
        });

        const autoRankoutsEnabled = await this.gameFeatureService.featureIsEnabled(
            FeatureCode.AUTO_RANKOUTS,
            rocketLeague.id,
            mleOrg.id,
        );
        const autoSalariesEnabled = await this.gameFeatureService.featureIsEnabled(
            FeatureCode.AUTO_SALARIES,
            rocketLeague.id,
            mleOrg.id,
        );

        this.logger.log(`Feature flags: autoSalariesEnabled=${autoSalariesEnabled}, autoRankoutsEnabled=${autoRankoutsEnabled}`);

        if (!autoSalariesEnabled) {
            this.logger.log("Auto salaries disabled, skipping job");
            await this.analyticsService.send(AnalyticsEndpoint.Analytics, {
                name: "weekly_salaries_job",
                tags: [
                    ["status", "skipped"],
                    ["reason", "feature_disabled"],
                ],
                booleans: [ ["auto_salaries_enabled", false] ],
            });
            return;
        }

        this.logger.log(`Requesting salary calculation from ELO service (doRankouts=${autoRankoutsEnabled})`);
        const salaryData = await this.eloConnectorService.createJobAndWait(
            EloEndpoint.CalculateSalaries,
            {doRankouts: autoRankoutsEnabled},
        );

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
        if (!this.postgres) {
            this.logger.error("PostgresService not injected - this is a configuration error. Check that PostgresModule is imported.");
            return;
        }
        await this.ensureSchedulerSchema();
        await this.runSalariesIfDue();
        this.interval = setInterval(() => {
            this.runSalariesIfDue().catch(error => { this.logger.error(error) });
        }, WEEKLY_SALARIES_INTERVAL_MS);
        this.interval.unref?.();
    }

    onModuleDestroy(): void {
        if (this.interval) clearInterval(this.interval);
    }

    private async runSalariesIfDue(): Promise<void> {
        const now = new Date();
        const eastern = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
        if (eastern.getDay() !== 1 || eastern.getHours() < 12) return;

        const runKey = `${WEEKLY_SALARIES_JOB_NAME}:${eastern.toISOString().slice(0, 10)}`;
        const result = await this.postgres.query<{inserted: string;}>(
            `
                INSERT INTO sprocket.platform_scheduled_job (name, last_run_at)
                VALUES ($1, now())
                ON CONFLICT (name) DO NOTHING
                RETURNING name AS inserted
            `,
            [runKey],
        );
        if (!result.rows[0]) return;

        try {
            await this.runSalaries();
        } catch (error) {
            const e = error as Error;
            this.logger.error(e);
            await this.analyticsService.send(AnalyticsEndpoint.Analytics, {
                name: "weekly_salaries_job",
                tags: [
                    ["status", "failed"],
                    ["job_name", WEEKLY_SALARIES_JOB_NAME],
                ],
                strings: [ ["error_message", e.message] ],
            });
        }
    }

    private async ensureSchedulerSchema(): Promise<void> {
        await this.postgres.query("CREATE SCHEMA IF NOT EXISTS sprocket");
        await this.postgres.query(`
            CREATE TABLE IF NOT EXISTS sprocket.platform_scheduled_job (
                name text NOT NULL,
                last_run_at TIMESTAMPTZ NOT NULL,
                CONSTRAINT "PK_platform_scheduled_job" PRIMARY KEY (name)
            )
        `);
    }
}
