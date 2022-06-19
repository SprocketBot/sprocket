/* eslint-disable @typescript-eslint/no-magic-numbers */
import {
    Inject, Injectable, Logger,
} from "@nestjs/common";
import {ClientProxy} from "@nestjs/microservices";
import {lastValueFrom, timeout} from "rxjs";

import type {MicroserviceRequestOptions} from "../../global.types";
import {CommonClient, ResponseStatus} from "../../global.types";
import type {
    AnalyticsEndpoint, AnalyticsInput, AnalyticsResponse,
} from "./analytics.types";
import {AnalyticsSchemas} from "./analytics.types";

@Injectable()
export class AnalyticsService {
    private logger = new Logger(AnalyticsService.name);

    constructor(@Inject(CommonClient.Analytics) private microServiceClient: ClientProxy) {}

    async send<E extends AnalyticsEndpoint>(endpoint: E, data: AnalyticsInput<E>, options?: MicroserviceRequestOptions): Promise<AnalyticsResponse<E>> {
        // this.logger.debug(`Sending message to endpoint \`${endpoint}\` with data \`${JSON.stringify(data, null, 2)}\``);

        const {input: inputSchema, output: outputSchema} = AnalyticsSchemas[endpoint];

        try {
            const input = inputSchema.parse(data);

            const rx = this.microServiceClient.send(endpoint, input).pipe(timeout(options?.timeout ?? 5000));

            const response = await lastValueFrom(rx) as unknown;

            // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
            const output = outputSchema.parse(response);

            this.logger.verbose(`Responding from endpoint \`${endpoint}\` with data \`${JSON.stringify(data, null, 2)}\``);
            return {
                status: ResponseStatus.SUCCESS,
                data: output,
            };
        } catch (e) {
            return {
                status: ResponseStatus.ERROR,
                error: e as Error,
            };
        }
    }

    parseInput<E extends AnalyticsEndpoint>(endpoint: E, data: unknown): AnalyticsInput<E> {
        const {input: inputSchema} = AnalyticsSchemas[endpoint];
        return inputSchema.parse(data);
    }
}
