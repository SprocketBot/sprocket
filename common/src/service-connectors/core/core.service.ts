/* eslint-disable @typescript-eslint/no-magic-numbers */
import {
    Inject, Injectable, Logger,
} from "@nestjs/common";
import {ClientProxy} from "@nestjs/microservices";
import {lastValueFrom} from "rxjs";

import {CommonClient, ResponseStatus} from "../../global.types";
import type {
    CoreEndpoint, CoreInput, CoreResponse,
} from "./core.types";
import {CoreSchemas} from "./core.types";

@Injectable()
export class CoreService {
    private logger = new Logger(CoreService.name);

    constructor(@Inject(CommonClient.Core) private microserviceClient: ClientProxy) {}

    async send<E extends CoreEndpoint>(endpoint: E, data: CoreInput<E>): Promise<CoreResponse<E>> {
        // this.logger.debug(`Sending message to endpoint \`${endpoint}\` with data \`${JSON.stringify(data, null, 2)}\``);

        const {input: inputSchema, output: outputSchema} = CoreSchemas[endpoint];

        try {
            const input = inputSchema.parse(data);

            const rx = this.microserviceClient.send(endpoint, input);

            const response = await lastValueFrom(rx) as unknown;

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

    parseInput<E extends CoreEndpoint>(endpoint: E, data: unknown): CoreInput<E> {
        const {input: inputSchema} = CoreSchemas[endpoint];
        return inputSchema.parse(data);
    }
}
