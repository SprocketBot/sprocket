import {z} from "zod";

export const EmbedSchema = z.object({
    title: z.string().max(256)
        .optional(),
    description: z.string().max(4096),
    url: z.string().optional(),
    /**
     * ISO8601 timestamp
     */
    timestamp: z.number().optional(),
    /**
     * Represented as a decimal.
     * @example
     * 0x00adff
     * @example
     * 44543
     */
    color: z.number().optional(),
    footer: z.object({
        text: z.string().max(2048),
        icon_url: z.string().optional(),
    }).optional(),
    image: z.object({

    }).optional(),
    thumbnail: z.object({

    }).optional(),
    video: z.object({

    }).optional(),
    author: z.object({
        name: z.string().max(256),
    }).optional(),
    fields: z.array(z.object({
        name: z.string().max(256),
        value: z.string().max(1024),
        inline: z.boolean().optional(),
    })).max(25)
        .optional(),
});

export type Embed = z.infer<typeof EmbedSchema>;
