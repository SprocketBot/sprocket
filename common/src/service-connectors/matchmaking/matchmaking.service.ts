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
    MatchmakingEndpoint,
    MatchmakingInput,
    MatchmakingResponse,
} from "./matchmaking.types";
import {MatchmakingSchemas} from "./matchmaking.types";

@Injectable()
export class MatchmakingService {
    private logger = new Logger(MatchmakingService.name);

    constructor(@Inject(CommonClient.Matchmaking) private microserviceClient: ClientProxy) {}

    async send<E extends MatchmakingEndpoint>(
        endpoint: E,
        data: MatchmakingInput<E>,
        options?: MicroserviceRequestOptions,
    ): Promise<MatchmakingResponse<E>> {
        const rid = uuidv4();
        this.logger.verbose(`| - (${rid}) > | \`${endpoint}\` (${JSON.stringify(data)})`);

        const {input: inputSchema, output: outputSchema} = MatchmakingSchemas[endpoint];

        try {
            const input = inputSchema.parse(data);

            const rx = this.microserviceClient
                .send(endpoint, input)
                .pipe(timeout(options?.timeout ?? 5000));

            const response = (await lastValueFrom(rx)) as unknown;

            // Handle case where response might be {} or null when array/object expected
            let output: unknown;
            if (Array.isArray(response)) {
                output = response;
            } else if (response && typeof response === 'object' && Object.keys(response).length === 0) {
                // Handle empty object {} - treat as empty array or null
                this.logger.debug(`Received empty object {}, treating as empty array for ${endpoint}`);
                output = [];
            } else if (response === null || response === undefined) {
                output = null;
            } else {
                output = response;
            }

            const parsed = outputSchema.parse(output);
            this.logger.verbose(`| < (${rid}) - | \`${endpoint}\` (${JSON.stringify(parsed)})`);
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

    parseInput<E extends MatchmakingEndpoint>(endpoint: E, data: unknown): MatchmakingInput<E> {
        const {input: inputSchema} = MatchmakingSchemas[endpoint];
        return inputSchema.parse(data);
    }
}
