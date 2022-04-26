import * as z from "zod";

import {inputDataSchema} from "../types";

export const CreateImageSchema = z.object({
    filterValues: inputDataSchema,
    inputFile: z.string(),
    outputFile: z.string(),
});

export type CreateImageData = z.infer<typeof CreateImageSchema>;
