import {z} from "zod";

export const GetSkillGroupWebhooks_Request = z.object({
    skillGroupId: z.number(),
});

export const GetSkillGroupWebhooks_Response = z.object({
    scrimReportCards: z.string().nullable().optional(),
    matchReportCards: z.string().nullable().optional(),
    scrim: z.string().nullable().optional(),
    scrimRole: z.string().nullable().optional(),
});
