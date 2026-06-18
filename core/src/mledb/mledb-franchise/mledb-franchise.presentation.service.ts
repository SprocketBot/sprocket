import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository, ILike} from "typeorm";
import {MLE_Player, MLE_Team, MLE_TeamBranding, MLE_TeamToCaptain} from "../../database/mledb";

interface FranchiseStaff {
    id: number;
    name: string;
    role: string;
}

interface FranchiseBranding {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
}

interface RosterPlayer {
    id: number;
    mleid: number;
    name: string;
    role?: string;
    league?: string;
    salary: number;
}

interface FranchiseDetailResult {
    name: string;
    callsign: string;
    division?: string;
    conference?: string;
    branding?: FranchiseBranding;
    franchiseManager?: FranchiseStaff;
    generalManagers: FranchiseStaff[];
    assistantGeneralManagers: FranchiseStaff[];
    captains: FranchiseStaff[];
    roster: RosterPlayer[];
    totalSalaryCap: number;
    usedSalary: number;
    remainingSalary: number;
}

interface FranchiseSummaryResult {
    name: string;
    callsign: string;
    division?: string;
    rosterCount: number;
    usedSalary: number;
}

/**
 * Service for MLEDB franchise presentation layer.
 * Provides franchise search and detail queries for the presentation layer.
 */
@Injectable()
export class MledbFranchisePresentationService {
    constructor(
        @InjectRepository(MLE_Team)
        private readonly teamRepo: Repository<MLE_Team>,
        @InjectRepository(MLE_Player)
        private readonly playerRepo: Repository<MLE_Player>,
    ) {}

    /**
     * Search franchises by partial name match.
     */
    async searchFranchises(query: string, limit: number = 10): Promise<FranchiseSummaryResult[]> {
        const normalizedQuery = query.trim();
        if (!normalizedQuery) {
            return [];
        }

        const safeLimit = Math.min(Math.max(limit, 1), 25);

        const teams = await this.teamRepo.find({
            where: {name: ILike(`%${normalizedQuery}%`)},
            take: safeLimit,
            relations: ["branding"],
            order: {name: "ASC"},
        });

        // Get roster counts and salary totals for each team
        const results: FranchiseSummaryResult[] = [];
        for (const team of teams) {
            const roster = await this.getRosterForTeam(team.name);
            const usedSalary = roster.reduce((sum, p) => sum + p.salary, 0);

            results.push({
                name: team.name,
                callsign: team.callsign,
                division: team.divisionName?.name,
                rosterCount: roster.length,
                usedSalary,
            });
        }

        return results;
    }

    /**
     * Get all franchises for index page.
     */
    async getAllFranchises(limit: number = 50): Promise<FranchiseSummaryResult[]> {
        const safeLimit = Math.min(Math.max(limit, 1), 100);

        const teams = await this.teamRepo.find({
            take: safeLimit,
            relations: ["branding"],
            order: {name: "ASC"},
        });

        const results: FranchiseSummaryResult[] = [];
        for (const team of teams) {
            const roster = await this.getRosterForTeam(team.name);
            const usedSalary = roster.reduce((sum, p) => sum + p.salary, 0);

            results.push({
                name: team.name,
                callsign: team.callsign,
                division: team.divisionName?.name,
                rosterCount: roster.length,
                usedSalary,
            });
        }

        return results;
    }

    /**
     * Get detailed franchise information including staff and roster.
     */
    async getFranchiseDetail(name: string): Promise<FranchiseDetailResult | null> {
        const team = await this.teamRepo.findOne({
            where: {name},
            relations: [
                "branding",
                "franchiseManager",
                "generalManager",
                "doublesAssistantGeneralManager",
                "standardAssistantGeneralManager",
                "divisionName",
            ],
        });

        if (!team) {
            return null;
        }

        // Build staff list
        const staff: FranchiseStaff[] = [];
        if (team.franchiseManager) {
            staff.push({
                id: team.franchiseManager.id,
                name: team.franchiseManager.name,
                role: "Franchise Manager",
            });
        }
        if (team.generalManager) {
            staff.push({
                id: team.generalManager.id,
                name: team.generalManager.name,
                role: "General Manager",
            });
        }
        if (team.doublesAssistantGeneralManager) {
            staff.push({
                id: team.doublesAssistantGeneralManager.id,
                name: team.doublesAssistantGeneralManager.name,
                role: "Doubles Assistant GM",
            });
        }
        if (team.standardAssistantGeneralManager) {
            staff.push({
                id: team.standardAssistantGeneralManager.id,
                name: team.standardAssistantGeneralManager.name,
                role: "Standard Assistant GM",
            });
        }

        // Get captains from team_to_captain table
        const captains = await this.getCaptainsForTeam(name);

        // Get roster
        const roster = await this.getRosterForTeam(name);
        const usedSalary = roster.reduce((sum, p) => sum + p.salary, 0);

        // Default salary cap (can be made configurable)
        const totalSalaryCap = 1000;

        // Determine conference from division
        let conference: string | undefined;
        if (team.divisionName?.name) {
            const divName = team.divisionName.name;
            if (divName.includes("Premier") || divName.includes("Champ") || divName.includes("Master")) {
                conference = "Champions";
            } else {
                conference = "Contenders";
            }
        }

        return {
            name: team.name,
            callsign: team.callsign,
            division: team.divisionName?.name,
            conference,
            branding: team.branding
                ? {
                      logo: team.branding.logoImgLink ?? undefined,
                      primaryColor: team.branding.primaryColor ?? undefined,
                      secondaryColor: team.branding.secondaryColor ?? undefined,
                  }
                : undefined,
            franchiseManager: staff.find((s) => s.role === "Franchise Manager"),
            generalManagers: staff.filter((s) => s.role === "General Manager"),
            assistantGeneralManagers: staff.filter((s) => s.role.includes("Assistant GM")),
            captains,
            roster,
            totalSalaryCap,
            usedSalary,
            remainingSalary: totalSalaryCap - usedSalary,
        };
    }

    private async getRosterForTeam(teamName: string): Promise<RosterPlayer[]> {
        const players = await this.playerRepo.find({
            where: {teamName},
        });

        return players.map((p) => ({
            id: p.id,
            mleid: p.mleid,
            name: p.name,
            role: p.role ?? undefined,
            league: p.league ? String(p.league) : undefined,
            salary: p.salary,
        }));
    }

    private async getCaptainsForTeam(teamName: string): Promise<FranchiseStaff[]> {
        const captainRepo = this.playerRepo.manager.getRepository(MLE_TeamToCaptain);

        const captains = await captainRepo.find({
            where: {teamName},
        });

        const staff: FranchiseStaff[] = [];
        for (const captain of captains) {
            const player = await this.playerRepo.findOne({
                where: {id: captain.playerId},
            });
            if (player) {
                staff.push({
                    id: player.id,
                    name: player.name,
                    role: "Captain",
                });
            }
        }

        return staff;
    }
}