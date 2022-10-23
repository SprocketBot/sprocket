import * as z from "zod";

export const UserProfileSchema = z.object({
    email: z.string(),
    displayName: z.string(),
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
});

export const UserSchema = z.object({
    id: z.number(),
    profile: UserProfileSchema.optional(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type User = z.infer<typeof UserSchema>;
