import * as z from "zod";

import {templateStructureSchema} from "../types";

export const CreateImageSchema = z.object({
    filterValues: templateStructureSchema,
    inputFile: z.string(),
    outputFile: z.string(),
});

export type CreateImageData = z.infer<typeof CreateImageSchema>;
