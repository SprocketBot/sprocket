import {z} from "zod";

export const ScrimMetricsSchema = z.object({
    // Can't have negative pending scrims or players
    pendingScrims: z.number().min(0),
    totalScrims: z.number().min(0),
    playersScrimming: z.number().min(0),
    playersQueued: z.number().min(0),
    totalPlayers: z.number().min(0),
});

export type ScrimMetrics = z.infer<typeof ScrimMetricsSchema>;
