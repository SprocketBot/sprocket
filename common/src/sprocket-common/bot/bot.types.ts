import type {z} from "zod";

import type {ResponseStatus} from "../../global.types";
import * as Schemas from "./schemas";

export enum BotEndpoint {
    SendMessageToGuildTextChannel = "SendMessageToGuildTextChannel",
}

export const BotSchemas = {
    [BotEndpoint.SendMessageToGuildTextChannel]: {
        input: Schemas.SendGuildTextMessage_Request,
        output: Schemas.SendGuildTextMessage_Response,
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
