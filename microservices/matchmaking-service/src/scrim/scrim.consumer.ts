import type {OnApplicationBootstrap, OnModuleDestroy} from "@nestjs/common";
import {Injectable, Logger} from "@nestjs/common";
import {ScrimStatus} from "@sprocketbot/common";
import {compareAsc} from "date-fns";

import {ScrimService} from "./scrim.service";
import {ScrimCrudService} from "./scrim-crud/scrim-crud.service";

// Configurable via SCRIM_CLOCK_INTERVAL_MS env var (default: 2 minutes)
const SCRIM_CLOCK_INTERVAL_MS = parseInt(process.env.SCRIM_CLOCK_INTERVAL_MS || "120000", 10);

@Injectable()
export class ScrimConsumer implements OnApplicationBootstrap, OnModuleDestroy {
    private readonly logger = new Logger(ScrimConsumer.name);

    private interval?: NodeJS.Timeout;

    constructor(private readonly scrimService: ScrimService, private readonly scrimCrudService: ScrimCrudService) {}

    async scrimClock(): Promise<void> {
        // Use efficient query that only loads pending/popped scrims instead of all scrims
        const scrims = await this.scrimCrudService.getScrimsForClockCheck();

        for (const scrim of scrims.filter(s => s.status === ScrimStatus.PENDING)) {
            for (const player of scrim.players) {
                if (compareAsc(new Date(), player.leaveAt) > 0) {
                    if (scrim.players.length === 1) {
                        await this.scrimService.cancelScrim(scrim.id);
                    } else {
                        await this.scrimService.leaveScrim(scrim.id, player.id);
                    }
                }
            }
        }

        for (const scrim of scrims.filter(s => s.status === ScrimStatus.POPPED)) {
            const poppedAt = scrim.poppedAt ?? scrim.updatedAt;
            const timeoutAt = new Date(poppedAt.getTime() + scrim.settings.checkinTimeout);
            if (compareAsc(new Date(), timeoutAt) <= 0) continue;
            await this.scrimService.cancelScrim(scrim.id);
        }
    }

    onApplicationBootstrap(): void {
        this.interval = setInterval(() => {
            this.scrimClock().catch(error => { this.logger.error(error) });
        }, SCRIM_CLOCK_INTERVAL_MS);
        this.interval.unref();
    }

    onModuleDestroy(): void {
        if (this.interval) clearInterval(this.interval);
    }
}
