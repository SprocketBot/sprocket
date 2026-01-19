import { z } from 'zod';

export enum GenerateReportCardType {
  SCRIM = 'SCRIM',
  SERIES = 'SERIES',
}

export const GenerateReportCardBase = z.object({
  type: z.nativeEnum(GenerateReportCardType),
});

export const GenerateReportCardScrim = GenerateReportCardBase.extend({
  type: z.literal(GenerateReportCardType.SCRIM),
  mleScrimId: z.number(),
});

export const GenerateReportCardMatch = GenerateReportCardBase.extend({
  type: z.literal(GenerateReportCardType.SERIES),
  mleSeriesId: z.number(),
});

export const GenerateReportCard_Request = z.union([
  GenerateReportCardScrim,
  GenerateReportCardMatch,
]);

export const GenerateReportCard_Response = z.string();

export type GenerateReportCardResponse = z.infer<typeof GenerateReportCard_Response>;
