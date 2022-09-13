import {z} from "zod";

export const ScrimDatabaseIdsSchema = z.object({
    id: z.number(),
    legacyId: z.number(),
});

export type ScrimDatabaseIds = z.infer<typeof ScrimDatabaseIdsSchema>;
