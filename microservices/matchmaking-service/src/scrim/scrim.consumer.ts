import {InjectQueue, OnQueueFailed, Process, Processor} from "@nestjs/bull";
import {Logger} from "@nestjs/common";
import {ScrimStatus} from "@sprocketbot/common";
import {Job, Queue} from "bull";
import {compareAsc} from "date-fns";
import now from "lodash.now";

import {ScrimService} from "./scrim.service";
import {ScrimCrudService} from "./scrim-crud/scrim-crud.service";

export const MATCHMAKING_QUEUE = "matchmaking";
const SCRIM_CLOCK_JOB = "scrimClockJob";

@Processor(MATCHMAKING_QUEUE)
export class ScrimConsumer {
    private readonly logger = new Logger(ScrimConsumer.name);

    constructor(
        @InjectQueue(MATCHMAKING_QUEUE) private matchmakingQueue: Queue,
        private readonly scrimService: ScrimService,
        private readonly scrimCrudService: ScrimCrudService,
    ) {}

    @OnQueueFailed()
    async onFailure(_: Job, error: Error): Promise<void> {
        this.logger.error(error);
    }

    @Process({name: SCRIM_CLOCK_JOB})
    async scrimClock(): Promise<void> {
        const scrims = await this.scrimCrudService.getAllScrims({});

        for (const scrim of scrims.filter(s => s.status === ScrimStatus.PENDING)) {
            for (const player of scrim.players) {
                if (compareAsc(now(), player.leaveAt) > 0) {
                    if (scrim.players.length === 1) {
                        await this.scrimService.cancelScrim(scrim.id);
                    } else {
                        await this.scrimService.leaveScrim(scrim.id, player.userId);
                    }
                }
            }
        }
    }

    async onApplicationBootstrap(): Promise<void> {
        const repeatableJobs = await this.matchmakingQueue.getRepeatableJobs();

        if (!repeatableJobs.some(job => job.name === SCRIM_CLOCK_JOB)) {
            this.logger.debug("Found no job for scrim clock, creating");

            await this.matchmakingQueue.add(SCRIM_CLOCK_JOB, null, {
                repeat: {
                    cron: "*/2 * * * *",
                },
                removeOnComplete: true,
            });
        } else {
            this.logger.debug("Job for scrim clock already exists");
        }
    }
}
