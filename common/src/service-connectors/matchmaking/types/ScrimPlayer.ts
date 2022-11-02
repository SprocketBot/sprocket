import {z} from "zod";

import {DateSchema} from "../../../types";

export const ScrimPlayerSchema = z.object({
    userId: z.number(),
    name: z.string(),
    joinedAt: DateSchema,
    leaveAt: DateSchema,
    group: z.string().optional(),
    checkedIn: z.boolean().default(false).optional(),
});

export type ScrimPlayer = z.infer<typeof ScrimPlayerSchema>;
