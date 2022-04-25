import {
    ResolveField, Resolver, Root,
} from "@nestjs/graphql";
import {ScrimStatus} from "@sprocketbot/common";

import type {ScrimPlayer} from "./types";
import {Scrim} from "./types";

@Resolver(() => Scrim)
export class ScrimResolver {
    @ResolveField()
    players(@Root() scrim: Scrim): undefined | ScrimPlayer[] {
        if (scrim.status === ScrimStatus.PENDING) return undefined;
        return scrim.players ?? [];
    }

    @ResolveField()
    playerCount(@Root() scrim: Scrim): number {
        return scrim.players?.length ?? 0;
    }

    @ResolveField()
    maxPlayers(@Root() scrim: Scrim): number {
        return scrim.settings.teamCount * scrim.settings.teamSize;
    }
}
