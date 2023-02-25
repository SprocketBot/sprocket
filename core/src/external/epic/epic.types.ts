import {DateSchema} from "@sprocketbot/common";
import {z} from "zod";

export const EpicLinkedAccountSchema = z.object({
    identityProviderId: z.enum(["xbl", "psn", "steam", "nintendo"]),
    accountId: z.string(),
    displayName: z.string(),
});

export const EpicProfileSchema = z.object({
    accountId: z.string(),
    displayName: z.string(),
    preferredLanguage: z.string(),
    linkedAccounts: EpicLinkedAccountSchema.array(),
    empty: z.boolean(),
});

export type EpicProfile = z.infer<typeof EpicProfileSchema>;

export const EpicTokenResponseSchema = z.object({
    token_type: z.literal("bearer"),
    access_token: z.string(),
    expires_in: z.number(),
    expires_at: DateSchema,
    client_id: z.string(),
    application_id: z.string(),
});
