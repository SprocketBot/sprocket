/* eslint-disable @typescript-eslint/no-magic-numbers */
import {Inject, Injectable, Logger} from "@nestjs/common";
import {ClientProxy} from "@nestjs/microservices";
import {lastValueFrom, timeout} from "rxjs";

import type {MicroserviceRequestOptions} from "../../global.types";
import {CommonClient, ResponseStatus} from "../../global.types";
import {NanoidService} from "../../util/nanoid/nanoid.service";
import type {
    MatchmakingEndpoint,
    MatchmakingInput,
    MatchmakingResponse,
} from "./matchmaking.types";
import {MatchmakingSchemas} from "./matchmaking.types";

@Injectable()
export class MatchmakingService {
    private logger = new Logger(MatchmakingService.name);

    constructor(
        @Inject(CommonClient.Matchmaking)
        private microserviceClient: ClientProxy,
        private readonly nidService: NanoidService,
    ) {}

    async send<E extends MatchmakingEndpoint>(
        endpoint: E,
        data: MatchmakingInput<E>,
        options?: MicroserviceRequestOptions,
    ): Promise<MatchmakingResponse<E>> {
        const rid = this.nidService.gen();
        this.logger.verbose(
            `| - (${rid}) > | \`${endpoint}\` (${JSON.stringify(data)})`,
        );

        const {input: inputSchema, output: outputSchema} =
            MatchmakingSchemas[endpoint];

        try {
            const input = inputSchema.parse(data);

            const rx = this.microserviceClient
                .send(endpoint, input)
                .pipe(timeout(options?.timeout ?? 5000));

            const response = (await lastValueFrom(rx)) as unknown;

            const output = outputSchema.parse(response);
            this.logger.verbose(
                `| < (${rid}) - | \`${endpoint}\` (${JSON.stringify(output)})`,
            );
            return {
                status: ResponseStatus.SUCCESS,
                data: output,
            };
        } catch (e) {
            this.logger.warn(
                `| < (${rid}) - | \`${endpoint}\` failed ${
                    (e as Error).message
                }`,
            );
            return {
                status: ResponseStatus.ERROR,
                error: e as Error,
            };
        }
    }

    parseInput<E extends MatchmakingEndpoint>(
        endpoint: E,
        data: unknown,
    ): MatchmakingInput<E> {
        const {input: inputSchema} = MatchmakingSchemas[endpoint];
        return inputSchema.parse(data);
    }
}
