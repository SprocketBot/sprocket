import * as z from "zod";

export const SkillGroupProfileSchema = z.object({
    scrimReportWebhookUrl: z.string().nullable()
        .optional(),
    matchReportWebhookUrl: z.string().nullable()
        .optional(),
});

export const SkillGroupSchema = z.object({
    id: z.number(),
});

export type SkillGroupProfile = z.infer<typeof SkillGroupProfileSchema>;
export type SkillGroup = z.infer<typeof SkillGroupSchema>;
