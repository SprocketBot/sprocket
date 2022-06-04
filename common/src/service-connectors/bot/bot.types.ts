import {z} from "zod";

import type {ResponseStatus} from "../../global.types";

export enum BotEndpoint {
    Temp = "Temp",
}

export const BotSchemas = {
    [BotEndpoint.Temp]: {
        input: z.unknown(),
        output: z.unknown(),
    },
};

export type BotInput<T extends BotEndpoint> = z.infer<typeof BotSchemas[T]["input"]>;
export type BotOutput<T extends BotEndpoint> = z.infer<typeof BotSchemas[T]["output"]>;

export interface BotSuccessResponse<T extends BotEndpoint> {
    status: ResponseStatus.SUCCESS;
    data: BotOutput<T>;
}

export interface BotErrorResponse {
    status: ResponseStatus.ERROR;
    error: Error;
}

export type BotResponse<T extends BotEndpoint> = BotSuccessResponse<T> | BotErrorResponse;
