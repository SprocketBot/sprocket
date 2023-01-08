import {z} from "zod";

export const MicrosoftProfileSchema = z.object({
    name: z.object({
        givenName: z.string(),
    }),
    id: z.string(),
    displayName: z.string(),
    emails: z.array(
        z.object({
            type: z.string(),
            value: z.string(),
        }),
    ),
});

export type MicrosoftProfile = z.infer<typeof MicrosoftProfileSchema>;
