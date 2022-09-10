import {z} from "zod";

export const GetTransactionsDiscordWebhook_Request = z.object({
    organizationId: z.number(),
});

export const GetTransactionsDiscordWebhook_Response = z.object({
    transactionsWebhook: z.string().nullable(),
});
