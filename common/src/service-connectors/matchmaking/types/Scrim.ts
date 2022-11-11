import {z} from "zod";

import {DateSchema} from "../../../types";
import {ScrimGameSchema} from "./ScrimGame";
import {ScrimLobbySchema} from "./ScrimLobby";
import {ScrimPlayerSchema} from "./ScrimPlayer";
import {ScrimSettingsSchema} from "./ScrimSettings";
import {ScrimStatus} from "./ScrimStatus.enum";

export const ScrimSchema = z.object({
    id: z.string().uuid(),
    createdAt: DateSchema,
    updatedAt: DateSchema,

    status: z.nativeEnum(ScrimStatus),
    unlockedStatus: z.nativeEnum(ScrimStatus).optional(),
    lockedReason: z.string().optional(),

    authorUserId: z.number(),
    organizationId: z.number(),
    gameModeId: z.number(),
    skillGroupId: z.number(),
    submissionId: z.string().optional(),
    timeoutJobId: z.number().optional(),

    players: z.array(ScrimPlayerSchema),
    games: z.array(ScrimGameSchema).default([]).optional(),

    lobby: ScrimLobbySchema.optional(),
    settings: ScrimSettingsSchema,
});

export type Scrim = z.infer<typeof ScrimSchema>;
