import {z} from "zod";

export const ScrimPlayerSchema = z.object({
    id: z.number(),
    name: z.string(),
    checkedIn: z.boolean().default(false).optional(),
    group: z.string().optional(),
});

export type ScrimPlayer = z.infer<typeof ScrimPlayerSchema>;
