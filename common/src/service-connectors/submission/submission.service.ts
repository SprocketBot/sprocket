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

            const output = outputSchema.parse(response);
            this.logger.verbose(`| < (${rid}) - | \`${endpoint}\` (${JSON.stringify(output)})`);
            return {
                status: ResponseStatus.SUCCESS,
                data: output,
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
