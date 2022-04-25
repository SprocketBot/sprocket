/* eslint-disable @typescript-eslint/no-magic-numbers */
import {
    Inject, Injectable, Logger,
} from "@nestjs/common";
import {ClientProxy} from "@nestjs/microservices";
import {lastValueFrom} from "rxjs";

import {CommonClient, ResponseStatus} from "../../global.types";
import type {
    BotEndpoint, BotInput, BotResponse,
} from "./bot.types";
import {BotSchemas} from "./bot.types";

@Injectable()
export class BotService {
    private logger = new Logger(BotService.name);

    constructor(@Inject(CommonClient.Bot) private microserviceClient: ClientProxy) {}

    async send<E extends BotEndpoint>(endpoint: E, data: BotInput<E>): Promise<BotResponse<E>> {
        // this.logger.debug(`Sending message to endpoint \`${endpoint}\` with data \`${JSON.stringify(data, null, 2)}\``);

        const {input: inputSchema, output: outputSchema} = BotSchemas[endpoint];

        try {
            const input = inputSchema.parse(data);

            const rx = this.microserviceClient.send(endpoint, input);

            const response = await lastValueFrom(rx) as unknown;

            const output = outputSchema.parse(response);

            this.logger.debug(`Responding from endpoint \`${endpoint}\` with data \`${JSON.stringify(data, null, 2)}\``);
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

    parseInput<E extends BotEndpoint>(endpoint: E, data: unknown): BotInput<E> {
        const {input: inputSchema} = BotSchemas[endpoint];
        return inputSchema.parse(data);
    }
}
