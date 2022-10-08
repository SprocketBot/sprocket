import type {z} from "zod";

import type {ResponseStatus} from "../../global.types";
import * as Schemas from "./schemas";

export enum NotificationEndpoint {
    SendNotification = "SendNotification",
}

export const NotificationSchemas = {
    [NotificationEndpoint.SendNotification]: {
        input: Schemas.SendNotification_Request,
        output: Schemas.SendNotification_Response,
    },
};

export type NotificationInput<T extends NotificationEndpoint> = z.infer<
    typeof NotificationSchemas[T]["input"]
>;
export type NotificationOutput<T extends NotificationEndpoint> = z.infer<
    typeof NotificationSchemas[T]["output"]
>;

export interface NotificationSuccessResponse<T extends NotificationEndpoint> {
    status: ResponseStatus.SUCCESS;
    data: NotificationOutput<T>;
}

export interface NotificationErrorResponse {
    status: ResponseStatus.ERROR;
    error: Error;
}

export type NotificationResponse<T extends NotificationEndpoint> =
    | NotificationSuccessResponse<T>
    | NotificationErrorResponse;
