import {z} from "zod";

export const ImageTemplateQueryFilterSchema = z.object({
    name: z.string(),
    description: z.string(),
    code: z.string(),
    query: z.string(),
});

export type ImageTemplateQueryFilter = z.infer<typeof ImageTemplateQueryFilterSchema>;

export const ImageTemplateQuerySchema = z.object({
    query: z.string(),
    filters: z.array(ImageTemplateQueryFilterSchema),
});

export type ImageTemplateQuery = z.infer<typeof ImageTemplateQuerySchema>;
