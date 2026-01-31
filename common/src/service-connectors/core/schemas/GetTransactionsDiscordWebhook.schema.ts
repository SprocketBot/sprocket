import {z} from "zod";

export const GetTransactionsDiscordWebhook_Request = z.object({
    organizationId: z.number(),
});

export const GetTransactionsDiscordWebhook_Response = z.object({
    transactionsWebhook: z.string().nullable(),
});

export type GetTransactionsDiscordWebhookRequest = z.infer<
  typeof GetTransactionsDiscordWebhook_Request
>;
export type GetTransactionsDiscordWebhookResponse = z.infer<
  typeof GetTransactionsDiscordWebhook_Response
>;
