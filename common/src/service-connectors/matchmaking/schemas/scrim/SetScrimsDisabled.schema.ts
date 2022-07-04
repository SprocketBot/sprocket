import {z} from "zod";

export const SetScrimsDisabled_Request = z.object({
    disabled: z.boolean(),
});

export const SetScrimsDisabled_Response = z.boolean();
