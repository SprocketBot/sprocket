/* eslint-disable @typescript-eslint/no-magic-numbers */
import {
    Inject, Injectable, Logger,
} from "@nestjs/common";
import {ClientProxy} from "@nestjs/microservices";
import {MicroservicesModule} from "@nestjs/microservices/microservices-module";
import {lastValueFrom, timeout} from "rxjs";

import type {MicroserviceRequestOptions} from "../../global.types";
import {CommonClient, ResponseStatus} from "../../global.types";
import type {
    MatchmakingEndpoint, MatchmakingInput, MatchmakingResponse,
} from "./matchmaking.types";
import {MatchmakingSchemas} from "./matchmaking.types";

@Injectable()
export class MatchmakingService {
    private logger = new Logger(MatchmakingService.name);

    constructor(@Inject(CommonClient.Matchmaking) private microserviceClient: ClientProxy) {}

    async send<E extends MatchmakingEndpoint>(endpoint: E, data: MatchmakingInput<E>, options?: MicroserviceRequestOptions): Promise<MatchmakingResponse<E>> {
        this.logger.verbose(`Sending message to endpoint=${endpoint} with data=${JSON.stringify(data)}`);

        const {input: inputSchema, output: outputSchema} = MatchmakingSchemas[endpoint];

        try {
            const input = inputSchema.parse(data);

            const rx = this.microserviceClient.send(endpoint, input).pipe(timeout(options?.timeout ?? 1000));

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

    parseInput<E extends MatchmakingEndpoint>(endpoint: E, data: unknown): MatchmakingInput<E> {
        const {input: inputSchema} = MatchmakingSchemas[endpoint];
        return inputSchema.parse(data);
    }
}
