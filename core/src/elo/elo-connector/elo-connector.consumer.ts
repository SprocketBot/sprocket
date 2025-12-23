import {
    OnGlobalQueueCompleted, OnGlobalQueueFailed, Processor,
} from "@nestjs/bull";
import {Logger} from "@nestjs/common";
import {JobId} from "bull";
import {AnalyticsEndpoint, AnalyticsService} from "@sprocketbot/common";

import {EloConnectorService} from "./elo-connector.service";
import {EloBullQueue, EloSchemas} from "./elo-connector.types";

@Processor(EloBullQueue)
export class EloConnectorConsumer {
    private readonly logger = new Logger(EloConnectorConsumer.name);

    constructor(
        private readonly eloConnectorService: EloConnectorService,
        private readonly analyticsService: AnalyticsService,
    ) {}

    @OnGlobalQueueCompleted()
    async onCompleted(job: JobId, result: string): Promise<void> {
        const listener = this.eloConnectorService.getJobListener(job);
        if (!listener) {
            this.logger.warn(`No listener found for completed job ${job}`);
            return;
        }

        this.logger.log(`Job ${job} completed for endpoint: ${listener.endpoint}`);

        try {
            const parsedResult = JSON.parse(result);
            this.logger.debug(`Job ${job} raw result: ${JSON.stringify(parsedResult)}`);

            const data = EloSchemas[listener.endpoint].output.parse(parsedResult);

            // Log summary based on endpoint type
            if (listener.endpoint === "CalculateSalaries") {
                const totalPlayers = data.flat().length;
                const playersWithRankouts = data.flat().filter((p: any) => p.rankout).length;
                this.logger.log(
                    `Job ${job}: Processed ${totalPlayers} players, ${playersWithRankouts} with rankouts`
                );
            }

            await listener.success(data);
            this.logger.log(`Job ${job} success handler completed`);

            // Emit success metrics
            await this.analyticsService.send(AnalyticsEndpoint.Analytics, {
                name: "elo_job_completed",
                tags: [
                    ["job_id", String(job)],
                    ["endpoint", listener.endpoint],
                    ["status", "success"],
                ],
            });
        } catch (e) {
            this.logger.error(
                `Job ${job} failed during result processing for endpoint ${listener.endpoint}`,
                e instanceof Error ? e.stack : JSON.stringify(e)
            );

            if (e instanceof Error) {
                await listener.failure(e);
            } else {
                await listener.failure(new Error(`Unknown error: ${JSON.stringify(e)}`));
            }

            // Emit failure metrics
            await this.analyticsService.send(AnalyticsEndpoint.Analytics, {
                name: "elo_job_completed",
                tags: [
                    ["job_id", String(job)],
                    ["endpoint", listener.endpoint],
                    ["status", "parsing_error"],
                ],
                strings: [
                    ["error_message", e instanceof Error ? e.message : JSON.stringify(e)],
                ],
            });
        }
    }

    @OnGlobalQueueFailed()
    async onFailed(job: JobId, e: Error): Promise<void> {
        const listener = this.eloConnectorService.getJobListener(job);
        if (!listener) {
            this.logger.warn(`No listener found for failed job ${job}`);
            return;
        }

        this.logger.error(
            `Job ${job} failed for endpoint ${listener.endpoint}: ${e.message}`,
            e.stack
        );

        await listener.failure(e);

        // Emit failure metrics
        await this.analyticsService.send(AnalyticsEndpoint.Analytics, {
            name: "elo_job_completed",
            tags: [
                ["job_id", String(job)],
                ["endpoint", listener.endpoint],
                ["status", "job_failed"],
            ],
            strings: [
                ["error_message", e.message],
            ],
        });
    }
}
