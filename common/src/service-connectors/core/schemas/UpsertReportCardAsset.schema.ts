import {z} from "zod";

export enum ReportCardAssetType {
    SCRIM = "SCRIM",
    MATCH = "MATCH",
}

export const UpsertReportCardAsset_Request = z.object({
    type: z.nativeEnum(ReportCardAssetType),
    organizationId: z.number(),
    sprocketId: z.number(),
    legacyId: z.number(),
    minioKey: z.string(),
    scrimUuid: z.string().uuid().optional(),
    userIds: z.array(z.number()).default([]),
    franchiseIds: z.array(z.number()).default([]),
});

export const UpsertReportCardAsset_Response = z.object({
    success: z.boolean(),
});

export type UpsertReportCardAssetRequest = z.infer<typeof UpsertReportCardAsset_Request>;
export type UpsertReportCardAssetResponse = z.infer<typeof UpsertReportCardAsset_Response>;
