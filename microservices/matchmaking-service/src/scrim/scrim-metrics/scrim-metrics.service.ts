import {Injectable} from "@nestjs/common";
import type {Scrim, ScrimMetrics} from "@sprocketbot/common";
import {ScrimStatus} from "@sprocketbot/common";

import {ScrimCrudService} from "../scrim-crud/scrim-crud.service";

@Injectable()
export class ScrimMetricsService {
    constructor(private readonly scrimCrudService: ScrimCrudService) {}

    async getScrimMetrics(): Promise<ScrimMetrics> {
        const allScrims = await this.scrimCrudService.getAllScrims();

        return allScrims.reduce<ScrimMetrics>(
            (acc: ScrimMetrics, v: Scrim) => {
                acc.totalPlayers += v.players.length;
                acc.totalScrims += 1;
                if (v.status === ScrimStatus.PENDING) {
                    acc.pendingScrims += 1;
                    acc.playersQueued += v.players.length;
                } else {
                    acc.playersScrimming += v.players.length;
                }
                return acc;
            },
            {
                pendingScrims: 0,
                playersQueued: 0,
                playersScrimming: 0,
                totalPlayers: 0,
                totalScrims: 0,
            },
        );
    }
}
