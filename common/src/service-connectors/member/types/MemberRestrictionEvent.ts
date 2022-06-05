import {z} from "zod";

export const MemberRestrictionEventSchema = z.object({
    id: z.number(),
    eventType: z.number(),
    message: z.string(),
    restriction: z.object({
        type: z.enum(["QUEUE_BAN", "RATIFICATION_BAN"]),
        expiration: z.preprocess(arg => {
            if (typeof arg === "string" || arg instanceof Date) {
                return new Date(arg);
            }
            return arg;
        }, z.date()),
        reason: z.string(),
        manualExpiration: z.preprocess(arg => {
            if (typeof arg === "string" || arg instanceof Date) {
                return new Date(arg);
            }
            return arg;
        }, z.date()).optional(),
        manualExpirationReason: z.string().optional(),
        member: z.object({
            id: z.number(),
        }),
        memberId: z.number(),
    }),
});
