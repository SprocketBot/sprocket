import {z} from "zod";

export enum MemberRestrictionType {
    QUEUE_BAN = "QUEUE_BAN",
    RATIFICATION_BAN = "RATIFICATION_BAN",
}

export const MemberRestrictionSchema = z.object({
    id: z.number(),
    type: z.nativeEnum(MemberRestrictionType),
    expiration: z.preprocess(arg => {
        if (typeof arg === "string") {
            return new Date(arg);
        }
        return arg;
    }, z.date()),
    reason: z.string(),
    manualExpiration: z.preprocess(arg => {
        if (typeof arg === "string") {
            return new Date(arg);
        }
        return arg;
    }, z.date()).nullable()
        .optional(),
    manualExpirationReason: z.string().nullable()
        .optional(),
    member: z.object({
        id: z.number(),
    }),
    memberId: z.number(),
});

export type MemberRestriction = z.infer<typeof MemberRestrictionSchema>;
