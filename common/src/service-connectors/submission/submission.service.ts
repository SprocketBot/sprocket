/* eslint-disable @typescript-eslint/no-magic-numbers */
import {
    Inject, Injectable, Logger,
} from "@nestjs/common";
import {ClientProxy} from "@nestjs/microservices";
import {lastValueFrom, timeout} from "rxjs";
import {v4 as uuidv4} from "uuid";

import type {MicroserviceRequestOptions} from "../../global.types";
import {CommonClient, ResponseStatus} from "../../global.types";
import type {
    SubmissionEndpoint, SubmissionInput, SubmissionResponse,
} from "./submission.types";
import {SubmissionSchemas} from "./submission.types";

@Injectable()
export class SubmissionService {
    private logger = new Logger(SubmissionService.name);

    constructor(@Inject(CommonClient.Submission) private microserviceClient: ClientProxy) {}

    async send<E extends SubmissionEndpoint>(
        endpoint: E,
        data: SubmissionInput<E>,
        options?: MicroserviceRequestOptions,
    ): Promise<SubmissionResponse<E>> {
        const rid = uuidv4();
        this.logger.verbose(`| - (${rid}) > | \`${endpoint}\` (${JSON.stringify(data)})`);

        const {input: inputSchema, output: outputSchema} = SubmissionSchemas[endpoint];

        try {
            const input = inputSchema.parse(data);

            const rx = this.microserviceClient
                .send(endpoint, input)
                .pipe(timeout(options?.timeout ?? 5000));

            const response = (await lastValueFrom(rx)) as unknown;

            // Debug: log the raw response type to help diagnose issues
            this.logger.debug(`Raw response for ${endpoint}: ${JSON.stringify(response).substring(0, 200)}`);

            // Handle case where response might be wrapped or incorrect
            let output: unknown;
            if (Array.isArray(response)) {
                output = response;
            } else if (response && typeof response === 'object' && 'data' in response) {
                // Handle { data: [...] } wrapper
                output = (response as {data: unknown}).data;
            } else {
                throw new Error(`Unexpected response type: ${typeof response}`);
            }

            const parsed = outputSchema.parse(output);
            this.logger.verbose(`| < (${rid}) - | \`${endpoint}\` (${JSON.stringify(parsed).substring(0, 100)}...)`);
            return {
                status: ResponseStatus.SUCCESS,
                data: parsed,
            };
        } catch (e) {
            this.logger.warn(`| < (${rid}) - | \`${endpoint}\` failed ${(e as Error).message}`);
            return {
                status: ResponseStatus.ERROR,
                error: e as Error,
            };
        }
    }

    parseInput<E extends SubmissionEndpoint>(endpoint: E, data: unknown): SubmissionInput<E> {
        const {input: inputSchema} = SubmissionSchemas[endpoint];
        return inputSchema.parse(data);
    }
}
