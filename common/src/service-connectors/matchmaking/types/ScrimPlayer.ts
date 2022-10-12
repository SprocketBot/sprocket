import {z} from "zod";

export const ScrimPlayerSchema = z.object({
    id: z.number(),
    name: z.string(),
    joinedAt: z.preprocess(arg => {
        if (typeof arg === "string") {
            return new Date(arg);
        }
        return arg;
    }, z.date()),
    leaveAfter: z.number().optional(),
    checkedIn: z.boolean().default(false)
        .optional(),
    group: z.string().optional(),
});

export type ScrimPlayer = z.infer<typeof ScrimPlayerSchema>;
