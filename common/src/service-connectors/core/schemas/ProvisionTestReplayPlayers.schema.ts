import {z} from "zod";

const Player = z.object({
    platform: z.string(),
    platformAccountId: z.string(),
    name: z.string(),
});

export const ProvisionTestReplayPlayers_Request = z.object({
    testRunId: z.string().uuid(),
    organizationId: z.number(),
    skillGroupId: z.number(),
    players: z.array(Player),
});

export const ProvisionTestReplayPlayers_Response = z.array(Player.extend({
    userId: z.number(),
    playerId: z.number(),
}));
