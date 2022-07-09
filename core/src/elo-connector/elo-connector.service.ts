import {
    InjectQueue, OnGlobalQueueCompleted, Processor,
} from "@nestjs/bull";
import {Injectable, Logger} from "@nestjs/common";
import {Job, Queue} from "bull";

import type {Match} from "../database";

@Injectable()
@Processor("elo")
export class EloConnectorService {
    private readonly logger = new Logger(EloConnectorService.name);

    constructor(@InjectQueue("elo") private eloQueue: Queue) { }

    /* eslint-disable */
    @OnGlobalQueueCompleted()
    onCompleted(job: Job, result: any): void {
        this.logger.verbose(`Job ${JSON.stringify(job)} completed with result: ${JSON.stringify(result)}`);
    }
    /* eslint-enable */

    async processSalaries(rankouts: boolean): Promise<void> {
        const job = await this.eloQueue.add("salaries", {doRankouts: rankouts});
        this.logger.verbose(`Started job in bull with ${JSON.stringify(job)} returned.`);
    }

    async runEloForSeries(match: Match): Promise<void> {
        const job = await this.eloQueue.add("series", match);
        this.logger.verbose(`Started job 'series' in bull with ${JSON.stringify(job)} returned.`);
    }

}
