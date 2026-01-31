import {z} from "zod";

export const EmbedBrandingOptionsSchema = z.object({
    author: z
        .object({
            icon: z.boolean().optional(),
            url: z.boolean().optional(),
        })
        .optional(),
    color: z.boolean().optional(),
    footer: z
        .object({
            text: z.boolean().optional(),
            icon: z.boolean().optional(),
        })
        .optional(),
    thumbnail: z.boolean().optional(),
    webhookUsername: z.boolean().optional(),
    webhookAvatar: z.boolean().optional(),
});

export const BrandingOptionsSchema = z.object({
    organizationId: z.number().optional(),
    options: EmbedBrandingOptionsSchema,
});

export type EmbedBrandingOptions = z.infer<typeof EmbedBrandingOptionsSchema>;
export type BrandingOptions = z.infer<typeof BrandingOptionsSchema>;
