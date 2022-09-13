import {z} from "zod";

export const AttachmentSchema = z.object({
    name: z.string().optional(),
    url: z.string(),
});

export type Attachment = z.infer<typeof AttachmentSchema>;
