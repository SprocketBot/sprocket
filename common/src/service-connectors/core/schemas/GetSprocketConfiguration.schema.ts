import {z} from "zod";

export const GetSprocketConfiguration_Request = z.object({
    key: z.string().optional(),
});

export const GetSprocketConfiguration_Response = z.array(z.object({
    key: z.string(),
    value: z.string(),
}));
