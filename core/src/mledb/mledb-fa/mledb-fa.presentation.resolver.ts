import {
    Args, Int, Query, Resolver,
} from "@nestjs/graphql";

import {MledbFaPresentationService} from "./mledb-fa.presentation.service";
import {MlePresentationFaList} from "./mledb-fa.presentation.types";

@Resolver()
export class MledbFaPresentationResolver {
    constructor(private readonly faService: MledbFaPresentationService) {}

    @Query(() => MlePresentationFaList)
    async mlePresentationFreeAgents(
        @Args("league", {type: () => String, nullable: true}) league?: string,
        @Args("limit", {type: () => Int, nullable: true}) limit?: number,
    ): Promise<MlePresentationFaList> {
        const result = await this.faService.getFreeAgents(league, limit ?? 50);
        return {
            league: result.league,
            players: result.players.map(p => ({
                id: p.id,
                mleid: p.mleid,
                name: p.name,
                teamName: p.teamName,
                league: p.league,
                salary: p.salary,
                role: p.role,
                suspended: p.suspended,
            })),
            totalCount: result.totalCount,
            totalSalary: result.totalSalary,
        };
    }

    @Query(() => MlePresentationFaList)
    async mlePresentationRestrictedFreeAgents(
        @Args("league", {type: () => String, nullable: true}) league?: string,
        @Args("limit", {type: () => Int, nullable: true}) limit?: number,
    ): Promise<MlePresentationFaList> {
        const result = await this.faService.getRestrictedFreeAgents(league, limit ?? 50);
        return {
            league: result.league,
            players: result.players.map(p => ({
                id: p.id,
                mleid: p.mleid,
                name: p.name,
                teamName: p.teamName,
                league: p.league,
                salary: p.salary,
                role: p.role,
                suspended: p.suspended,
            })),
            totalCount: result.totalCount,
            totalSalary: result.totalSalary,
        };
    }

    @Query(() => MlePresentationFaList)
    async mlePresentationWaiverClaims(
        @Args("league", {type: () => String, nullable: true}) league?: string,
        @Args("limit", {type: () => Int, nullable: true}) limit?: number,
    ): Promise<MlePresentationFaList> {
        const result = await this.faService.getWaiverClaims(league, limit ?? 50);
        return {
            league: result.league,
            players: result.players.map(p => ({
                id: p.id,
                mleid: p.mleid,
                name: p.name,
                teamName: p.teamName,
                league: p.league,
                salary: p.salary,
                role: p.role,
                suspended: p.suspended,
            })),
            totalCount: result.totalCount,
            totalSalary: result.totalSalary,
        };
    }
}
