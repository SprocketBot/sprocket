import {
    forwardRef, Inject, Injectable,
} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {CoreEndpoint, CoreOutput} from "@sprocketbot/common";
import type {FindOneOptions} from "typeorm";
import {Repository} from "typeorm";

import {Franchise} from "$db/franchise/franchise/franchise.model";
import {FranchiseProfile} from "$db/franchise/franchise_profile/franchise_profile.model";

import {MledbPlayerService} from "../../mledb";
import {MemberService} from "../../organization";
import {PlayerService} from "../player";

@Injectable()
export class FranchiseService {
    constructor(
    @InjectRepository(Franchise)
    private readonly franchiseRepository: Repository<Franchise>,
    @Inject(forwardRef(() => MledbPlayerService))
    private readonly mledbPlayerService: MledbPlayerService,
    private readonly sprocketMemberService: MemberService,
    @InjectRepository(FranchiseProfile)
    private readonly franchiseProfileRepository: Repository<FranchiseProfile>,
    ) {}

    async getFranchiseProfile(franchiseId: number): Promise<FranchiseProfile> {
        const franchise = await this.franchiseRepository.findOneOrFail({
            where: {id: franchiseId},
            relations: ["profile"],
        });
        return franchise.profile;
    }

    async getFranchiseById(franchiseId: number): Promise<Franchise> {
        return this.franchiseRepository.findOneOrFail({
            where: {id: franchiseId},
        });
    }

    async getFranchise(query: FindOneOptions<Franchise>): Promise<Franchise> {
        return this.franchiseRepository.findOneOrFail(query);
    }

    async getFranchiseByName(name: string): Promise<Franchise> {
        const profile = await this.franchiseProfileRepository.findOneOrFail({
            where: {
                title: name,
            },
            relations: {
                franchise: true,
            },
        });

        // Have to go back to the DB to get the franchise object with its
        // profile, rather than the profile with the franchise we had above
        return this.getFranchise({
            where: {id: profile.franchise.id},
            relations: {profile: true},
        });
    }

    async getPlayerFranchisesByMemberId(memberId: number): Promise<CoreOutput<CoreEndpoint.GetPlayerFranchises>> {
        const member = await this.sprocketMemberService.getMemberById(memberId);
        const {userId} = member;
        const mlePlayer = await this.mledbPlayerService.getMlePlayerBySprocketUser(userId);

        const playerId = mlePlayer.id;

        const team = await this.mledbPlayerService.getPlayerFranchise(playerId);

        // Check if this is a non-playing staff member (FP = Free Agent Pool, FA = Free Agent)
        if (team.name === "FP" || team.name === "FA") {
            return this.getFranchisesFromStaffAssignments(playerId, memberId);
        }

        // Regular player - try to get their playing franchise
        const isCaptain = await this.mledbPlayerService.playerIsCaptain(playerId);

        // Try to get the actual Sprocket franchise using the team name
        try {
            const franchise = await this.getFranchiseByName(team.name);

            const staffPositions: Array<{id: number; name: string;}> = [];

            if (team.franchiseManagerId === playerId) {
                staffPositions.push({id: 0, name: "FM"});
            }
            if (team.generalManagerId === playerId) {
                staffPositions.push({id: 0, name: "GM"});
            }
            if (
                team.doublesAssistantGeneralManagerId === playerId
                || team.standardAssistantGeneralManagerId === playerId
            ) {
                staffPositions.push({id: 0, name: "AGM"});
            }
            if (isCaptain) {
                staffPositions.push({id: 0, name: "CAP"});
            }

            return [
                {
                    id: franchise.id,
                    name: team.name,
                    staffPositions: staffPositions,
                },
            ];
        } catch (error) {
            // FALLBACK: If we can't find their franchise by team name, check staff assignments
            console.error(`Failed to find franchise for team "${team.name}" (player ${playerId}, member ${memberId}). Checking staff assignments as fallback:`, error instanceof Error ? error.message : error);
            return this.getFranchisesFromStaffAssignments(playerId, memberId);
        }
    }

    /**
     * Helper method to get franchises based on staff assignments
     * Used for FP/FA players and as a fallback when team franchise lookup fails
     */
    private async getFranchisesFromStaffAssignments(playerId: number, memberId: number): Promise<CoreOutput<CoreEndpoint.GetPlayerFranchises>> {
        // Get all teams where this player holds a staff position
        const staffTeams = await this.mledbPlayerService.getTeamsWherePlayerIsStaff(playerId);

        if (staffTeams.length === 0) {
            console.error(`Player ${playerId} (member ${memberId}) has no staff assignments found`);
            return [];
        }

        // Map each staff team to a franchise response
        const franchises: CoreOutput<CoreEndpoint.GetPlayerFranchises> = [];
        for (const staffTeam of staffTeams) {
            try {
                const franchise = await this.getFranchiseByName(staffTeam.name);

                const staffPositions: Array<{id: number; name: string;}> = [];
                if (staffTeam.franchiseManagerId === playerId) {
                    staffPositions.push({id: 0, name: "FM"});
                }
                if (staffTeam.generalManagerId === playerId) {
                    staffPositions.push({id: 0, name: "GM"});
                }
                if (
                    staffTeam.doublesAssistantGeneralManagerId === playerId
                    || staffTeam.standardAssistantGeneralManagerId === playerId
                ) {
                    staffPositions.push({id: 0, name: "AGM"});
                }

                franchises.push({
                    id: franchise.id,
                    name: staffTeam.name,
                    staffPositions: staffPositions,
                });
            } catch (error) {
                console.error(`Failed to find franchise for staff team "${staffTeam.name}" (player ${playerId}, member ${memberId}):`, error instanceof Error ? error.message : error);
                // Continue to next team instead of failing completely
            }
        }

        return franchises;
    }
}
