import {z} from "zod";


export const GenerateScrimReportCard_Request = z.object({
    scrimId: z.string(),
});

export const GenerateScrimReportCard_Response = z.object({
    outputFile: z.string(),
});
