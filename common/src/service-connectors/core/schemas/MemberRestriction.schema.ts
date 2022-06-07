import {z} from "zod";

export const MemberRestrictionSchema = z.object({
    id: z.number(),
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
});

export type MemberRestrictionSchemaType = z.infer<typeof MemberRestrictionSchema>;
