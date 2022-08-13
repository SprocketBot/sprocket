import {
    OnGlobalQueueCompleted, Process, Processor,
} from "@nestjs/bull";
import {Logger} from "@nestjs/common";
import {Job} from "bull";

import {EloConnectorService} from "./elo-connector.service";

export const WEEKLY_SALARIES_JOB_NAME = "weeklySalaries";
export const RUN_SALARIES_JOB_NAME = "salaries";

@Processor("elo")
export class EloConsumer {
    private readonly logger = new Logger(EloConsumer.name);

    constructor(private readonly eloService: EloConnectorService) {}

    /* eslint-disable */
    @OnGlobalQueueCompleted()
    async onCompleted(job: Job, result: any): Promise<void> {
        if (job.name === RUN_SALARIES_JOB_NAME) {
            try {
                const resObj = JSON.parse(result);
                this.logger.verbose(`Job ${JSON.stringify(job)} completed with result: ${result}, and ${JSON.stringify(resObj)}`);
                if (resObj.jobType) {
                    this.logger.verbose(`Salary job finished, processing on postgres side now. `);
                    // await this.eloService.saveSalaries(resObj.data);
                }
                /* eslint-enable */
            } catch (e) {
                this.logger.error(e);
            }
        }
    }

    @Process({name: WEEKLY_SALARIES_JOB_NAME})
    async runSalaries(): Promise<void> {
        this.logger.debug("Running weekly salaries!");
        await this.eloService.processSalaries(true);
    }
}
