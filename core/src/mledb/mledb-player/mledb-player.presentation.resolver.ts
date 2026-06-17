import {Args, Int, Query, Resolver} from "@nestjs/graphql";

import type {MLE_Player} from "../../database/mledb";
import {MledbPlayerService} from "./mledb-player.service";
import {
    MlePresentationPlayerDetail,
    MlePresentationPlayerSearchResult,
} from "./mledb-player.presentation.types";

@Resolver()
export class MledbPlayerPresentationResolver {
    constructor(private readonly mledbPlayerService: MledbPlayerService) {}

    @Query(() => [MlePresentationPlayerSearchResult])
    async mlePresentationPlayerSearch(
        @Args("query", {type: () => String}) query: string,
        @Args("limit", {type: () => Int, nullable: true}) limit?: number,
    ): Promise<MlePresentationPlayerSearchResult[]> {
        const players = await this.mledbPlayerService.searchPresentationPlayers(query, limit ?? 10);
        return players.map(player => this.toSearchResult(player));
    }

    @Query(() => MlePresentationPlayerDetail, {nullable: true})
    async mlePresentationPlayerDetail(
        @Args("playerId", {type: () => Int}) playerId: number,
    ): Promise<MlePresentationPlayerDetail | null> {
        const detail = await this.mledbPlayerService.getPresentationPlayerDetail(playerId);
        if (!detail) {
            return null;
        }

        const {player, orgTeams, platformAccounts} = detail;
        return {
            ...this.toSearchResult(player),
            role: player.role ?? undefined,
            preferredPlatform: player.preferredPlatform ?? undefined,
            peakMmr: player.peakMmr ?? undefined,
            timezone: player.timezone ? String(player.timezone) : undefined,
            discordId: player.discordId ?? undefined,
            modePreference: player.modePreference ? String(player.modePreference) : undefined,
            orgTeams,
            platformAccounts: platformAccounts.map(account => ({
                platform: String(account.platform),
                platformId: account.platformId ?? "",
                tracker: account.tracker ?? undefined,
            })),
        };
    }

    private toSearchResult(player: MLE_Player): MlePresentationPlayerSearchResult {
        return {
            id: player.id,
            mleid: player.mleid,
            name: player.name,
            teamName: player.teamName ?? undefined,
            league: player.league ? String(player.league) : undefined,
            salary: player.salary,
            suspended: player.suspended,
        };
    }
}
