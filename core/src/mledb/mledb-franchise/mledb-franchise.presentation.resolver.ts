import {
    Args, Int, Query, Resolver,
} from "@nestjs/graphql";

import {MledbFranchisePresentationService} from "./mledb-franchise.presentation.service";
import {
    MlePresentationFranchiseDetail,
    MlePresentationFranchiseSummary,
} from "./mledb-franchise.presentation.types";

@Resolver()
export class MledbFranchisePresentationResolver {
    constructor(private readonly franchiseService: MledbFranchisePresentationService) {}

    @Query(() => [MlePresentationFranchiseSummary])
    async mlePresentationFranchiseSearch(
        @Args("query", {type: () => String}) query: string,
        @Args("limit", {type: () => Int, nullable: true}) limit?: number,
    ): Promise<MlePresentationFranchiseSummary[]> {
        const franchises = await this.franchiseService.searchFranchises(query, limit ?? 10);
        return franchises.map(f => ({
            name: f.name,
            callsign: f.callsign,
            division: f.division,
            rosterCount: f.rosterCount,
            usedSalary: f.usedSalary,
        }));
    }

    @Query(() => [MlePresentationFranchiseSummary])
    async mlePresentationAllFranchises(@Args("limit", {type: () => Int, nullable: true}) limit?: number): Promise<MlePresentationFranchiseSummary[]> {
        const franchises = await this.franchiseService.getAllFranchises(limit ?? 50);
        return franchises.map(f => ({
            name: f.name,
            callsign: f.callsign,
            division: f.division,
            rosterCount: f.rosterCount,
            usedSalary: f.usedSalary,
        }));
    }

    @Query(() => MlePresentationFranchiseDetail, {nullable: true})
    async mlePresentationFranchiseDetail(@Args("name", {type: () => String}) name: string): Promise<MlePresentationFranchiseDetail | null> {
        const detail = await this.franchiseService.getFranchiseDetail(name);
        if (!detail) {
            return null;
        }

        return {
            name: detail.name,
            callsign: detail.callsign,
            division: detail.division,
            conference: detail.conference,
            branding: detail.branding
                ? {
                        logo: detail.branding.logo,
                        primaryColor: detail.branding.primaryColor,
                        secondaryColor: detail.branding.secondaryColor,
                    }
                : undefined,
            franchiseManager: detail.franchiseManager
                ? {
                        id: detail.franchiseManager.id,
                        name: detail.franchiseManager.name,
                        role: detail.franchiseManager.role,
                    }
                : undefined,
            generalManagers: detail.generalManagers.map(gm => ({
                id: gm.id,
                name: gm.name,
                role: gm.role,
            })),
            assistantGeneralManagers: detail.assistantGeneralManagers.map(agm => ({
                id: agm.id,
                name: agm.name,
                role: agm.role,
            })),
            captains: detail.captains.map(c => ({
                id: c.id,
                name: c.name,
                role: c.role,
            })),
            roster: detail.roster.map(p => ({
                id: p.id,
                mleid: p.mleid,
                name: p.name,
                role: p.role,
                league: p.league,
                salary: p.salary,
            })),
            totalSalaryCap: detail.totalSalaryCap,
            usedSalary: detail.usedSalary,
            remainingSalary: detail.remainingSalary,
        };
    }
}
