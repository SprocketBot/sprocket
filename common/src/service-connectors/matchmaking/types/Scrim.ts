import {z} from "zod";

import {ScrimGameSchema} from "./ScrimGame";
import {ScrimGameModeSchema} from "./ScrimGameMode";
import {ScrimPlayerSchema} from "./ScrimPlayer";
import {ScrimSettingsSchema} from "./ScrimSettings";

export enum ScrimStatus {
    // Active scrim states

    /**
     * Scrim is waiting for players
     */
    PENDING = "PENDING",

    /**
     * Scrim has filled, and players are checking in
     */
    POPPED = "POPPED",

    /**
     * Players are playing
     */
    IN_PROGRESS = "IN_PROGRESS",

    /**
     * Replays have been submitted, but have not yet finished parsing
     */
    SUBMITTING = "SUBMITTING",

    /**
     * Replays are uploaded, scrim players are ratifying the results
     */
    RATIFYING = "RATIFYING",

    /**
     * All players have left before scrim popped.
     * Scrim is being removed, this state is used for event broadcast
     */
    EMPTY = "EMPTY",

    /**
     * Replays are submitted, this scrim is being removed
     * This state is used for event broadcast
     */
    COMPLETE = "COMPLETE",

    /**
     * One or more players have not checked into the queue
     * Players will be queue banned and scrim will be removed
     */
    CANCELLED = "CANCELLED",

    /**
     * A locked scrim has manually been moved to this state by a support member,
     * and needs to be handled by a support team member
     */
    LOCKED = "LOCKED",
}

export const ScrimSchema = z.object({
    id: z.string().uuid(),
    status: z.nativeEnum(ScrimStatus),

    organizationId: z.number(),
    players: z.array(ScrimPlayerSchema),
    gameMode: ScrimGameModeSchema,
    skillGroupId: z.number(),

    settings: ScrimSettingsSchema,

    games: z.array(ScrimGameSchema)
        .default([])
        .optional(),

    submissionId: z.string().optional(),

    timeoutJobId: z.number().optional(),
});

export type Scrim = z.infer<typeof ScrimSchema>;
