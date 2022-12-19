import {z} from "zod";

export const GoogleProfileSchema = z.object({
    id: z.string(),
    displayName: z.string(),
    name: z.object({
        givenName: z.string(),
        familyName: z.string(),
    }),
    emails: z.array(
        z.object({
            value: z.string(),
            verified: z.boolean(),
        }),
    ),
    photos: z.array(
        z.object({
            value: z.string(),
        }),
    ),
});

export type GoogleProfile = z.infer<typeof GoogleProfileSchema>;
