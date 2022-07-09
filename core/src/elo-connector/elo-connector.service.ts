import {
    InjectQueue, OnGlobalQueueCompleted, Processor,
} from "@nestjs/bull";
import {Injectable, Logger} from "@nestjs/common";
import {Job, Queue} from "bull";

@Injectable()
@Processor("elo")
export class EloConnectorService {
    private readonly logger = new Logger(EloConnectorService.name);

    constructor(@InjectQueue("elo") private eloQueue: Queue) {}

    /* eslint-disable */
    @OnGlobalQueueCompleted()
    onCompleted(job: Job, result: any): void {
        this.logger.verbose(`Job ${JSON.stringify(job)} completed with result: ${JSON.stringify(result)}`);
    }
    /* eslint-enable */

    async processSalaries(rankouts: boolean): Promise<void> {
        await this.eloQueue.add("salaries", {doRankouts: rankouts});
    }

}
