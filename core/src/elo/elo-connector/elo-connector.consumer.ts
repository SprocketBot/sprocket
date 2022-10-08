import {
    OnGlobalQueueCompleted,
    OnGlobalQueueFailed,
    Processor,
} from "@nestjs/bull";
import {Logger} from "@nestjs/common";
import {JobId} from "bull";

import {EloConnectorService} from "./elo-connector.service";
import {EloBullQueue, EloSchemas} from "./elo-connector.types";

@Processor(EloBullQueue)
export class EloConnectorConsumer {
    private readonly logger = new Logger(EloConnectorConsumer.name);

    constructor(private readonly eloConnectorService: EloConnectorService) {}

    @OnGlobalQueueCompleted()
    async onCompleted(job: JobId, result: string): Promise<void> {
        const listener = this.eloConnectorService.getJobListener(job);
        if (!listener) return;

        try {
            const data = EloSchemas[listener.endpoint].output.parse(
                JSON.parse(result),
            );
            await listener.success(data);
        } catch (e) {
            if (e instanceof Error) await listener.failure(e);
            await listener.failure(new Error(JSON.stringify(e)));
        }
    }

    @OnGlobalQueueFailed()
    async onFailed(job: JobId, e: Error): Promise<void> {
        const listener = this.eloConnectorService.getJobListener(job);
        if (!listener) return;

        await listener.failure(e);
    }
}
