/* eslint-disable @typescript-eslint/no-magic-numbers */
import {Inject, Injectable, Logger} from "@nestjs/common";
import {ClientProxy} from "@nestjs/microservices";
import {lastValueFrom, timeout} from "rxjs";

import type {MicroserviceRequestOptions} from "../../global.types";
import {CommonClient, ResponseStatus} from "../../global.types";
import {NanoidService} from "../../util/nanoid/nanoid.service";
import type {BotEndpoint, BotInput, BotResponse} from "./bot.types";
import {BotSchemas} from "./bot.types";

@Injectable()
export class BotService {
    private logger = new Logger(BotService.name);

    constructor(
        @Inject(CommonClient.Bot) private microserviceClient: ClientProxy,
        private readonly nidService: NanoidService,
    ) {}

    async send<E extends BotEndpoint>(
        endpoint: E,
        data: BotInput<E>,
        options?: MicroserviceRequestOptions,
    ): Promise<BotResponse<E>> {
        const rid = this.nidService.gen();
        this.logger.verbose(`| - (${rid}) > | \`${endpoint}\` (${JSON.stringify(data)})`);

        const {input: inputSchema, output: outputSchema} = BotSchemas[endpoint];

        try {
            const input = inputSchema.parse(data);

            const rx = this.microserviceClient.send(endpoint, input).pipe(timeout(options?.timeout ?? 5000));

            const response = (await lastValueFrom(rx)) as unknown;

            const output = outputSchema.parse(response);
            this.logger.verbose(`<-| \`${endpoint}\` (${JSON.stringify(output)})`);
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

    parseInput<E extends BotEndpoint>(endpoint: E, data: unknown): BotInput<E> {
        const {input: inputSchema} = BotSchemas[endpoint];
        return inputSchema.parse(data);
    }
}
