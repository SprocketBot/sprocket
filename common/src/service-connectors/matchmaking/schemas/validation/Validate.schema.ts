import {z} from "zod";

export const ValidateReplays_Request = z.object({
    submissionId: z.string().nonempty(),
});

export const ValidateReplays_Response = z.boolean();
