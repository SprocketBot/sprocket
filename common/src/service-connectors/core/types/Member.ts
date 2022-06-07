import {z} from "zod";

import {OrganizationSchema} from "./Organization";
import {UserSchema} from "./User";

export const MemberProfileSchema = z.object({
    name: z.string(),
});

export const MemberSchema = z.object({
    id: z.number(),
    user: UserSchema,
    organization: OrganizationSchema,
});

export type MemberProfile = z.infer<typeof MemberProfileSchema>;
export type Member = z.infer<typeof MemberSchema>;
