/* eslint-disable @typescript-eslint/no-magic-numbers */
import {
    Inject, Injectable, Logger,
} from "@nestjs/common";
import {ClientProxy} from "@nestjs/microservices";
import {lastValueFrom, timeout} from "rxjs";

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

    async send<E extends SubmissionEndpoint>(endpoint: E, data: SubmissionInput<E>, options?: MicroserviceRequestOptions): Promise<SubmissionResponse<E>> {
        this.logger.verbose(`Sending message to endpoint=${endpoint} with data=${JSON.stringify(data)}`);

        const {input: inputSchema, output: outputSchema} = SubmissionSchemas[endpoint];

        try {
            const input = inputSchema.parse(data);

            const rx = this.microserviceClient.send(endpoint, input).pipe(timeout(options?.timeout ?? 5000));

            const response = await lastValueFrom(rx) as unknown;

            const output = outputSchema.parse(response);
            this.logger.verbose(`Replying from endpoint=${endpoint} with response=${JSON.stringify(response)}`);
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

    parseInput<E extends SubmissionEndpoint>(endpoint: E, data: unknown): SubmissionInput<E> {
        const {input: inputSchema} = SubmissionSchemas[endpoint];
        return inputSchema.parse(data);
    }
}
