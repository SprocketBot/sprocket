import {z} from "zod";

// id: number;
// message: string;
// type: MemberRestrictionType;
// expiration: Date;
// reason: string;
// manualExpiration?: Date;
// manualExpirationReason?: string;
// member: Member;
// memberId: number;
export const MemberRestrictionEventSchema = z.object({
    id: z.number(),
    eventType: z.number(),
    message: z.string(),
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
    memberId: z.number(),
});
