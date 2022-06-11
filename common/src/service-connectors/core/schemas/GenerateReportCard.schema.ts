import {z} from "zod";

export const GenerateReportCard_Request = z.object({mleScrimId: z.number()});

export const GenerateReportCard_Response = z.string();

export type GenerateReportCardResponse = z.infer<typeof GenerateReportCard_Response>;
