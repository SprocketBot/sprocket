import * as z from "zod";

export const OrganizationSchema = z.object({
    id: z.number(),
});

export type Organization = z.infer<typeof OrganizationSchema>;
