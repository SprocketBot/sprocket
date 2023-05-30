import type {Scrim} from "@sprocketbot/common";

import type {ScrimObject} from "../graphql/scrim/scrim.object";

export const convertScrimToScrimObject = (s: Scrim): ScrimObject => {
    return {
        authorUserId: s.authorUserId,
        createdAt: s.createdAt,
        gameModeId: s.gameModeId,
        games: s.games,
        id: s.id,
        lobby: s.lobby,
        lockedReason: s.lockedReason,
        maxPlayers: s.settings.teamSize * s.settings.teamCount,
        organizationId: s.organizationId,
        playerCount: s.players.length,
        players: s.players,
        settings: s.settings,
        skillGroupId: s.skillGroupId,
        status: s.status,
        submissionId: s.submissionId,
        timeoutAt: s.timeoutAt,
        updatedAt: s.updatedAt,
    };
};
