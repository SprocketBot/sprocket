import {z} from "zod";

export enum MemberRestrictionEventType {
    RESTRICTED = 1,
    UNRESTRICTED = 2,
}

export const MemberRestrictionEventSchema = z.object({
    id: z.number(),
    eventType: z.nativeEnum(MemberRestrictionEventType),
    message: z.string(),
    restriction: z.object({
        type: z.enum(["QUEUE_BAN", "RATIFICATION_BAN"]),
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
    }),
});
