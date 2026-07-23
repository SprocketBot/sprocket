import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import {MLE_Player} from "../../database/mledb";

interface FreeAgent {
    id: number;
    mleid: number;
    name: string;
    teamName?: string;
    league?: string;
    salary: number;
    role?: string;
    suspended: boolean;
}

interface FaListResult {
    league: string;
    players: FreeAgent[];
    totalCount: number;
    totalSalary: number;
}

/**
 * Service for MLEDB Free Agent presentation layer.
 * Provides FA/RFA/Waivers queries for the presentation layer.
 */
@Injectable()
export class MledbFaPresentationService {
    constructor(@InjectRepository(MLE_Player)
        private readonly playerRepo: Repository<MLE_Player>) {}

    /**
     * Get free agents (players where teamName = 'FA')
     */
    async getFreeAgents(league?: string, limit: number = 50): Promise<FaListResult> {
        const safeLimit = Math.min(Math.max(limit, 1), 100);

        const query = this.playerRepo.createQueryBuilder("player")
            .where("player.teamName = :teamName", {teamName: "FA"})
            .andWhere("player.suspended = :suspended", {suspended: false})
            .orderBy("player.salary", "DESC")
            .addOrderBy("player.name", "ASC")
            .take(safeLimit);

        if (league) {
            query.andWhere("player.league = :league", {league});
        }

        const players = await query.getMany();

        const mappedPlayers: FreeAgent[] = players.map(p => ({
            id: p.id,
            mleid: p.mleid,
            name: p.name,
            teamName: p.teamName ?? undefined,
            league: p.league ? String(p.league) : undefined,
            salary: p.salary,
            role: p.role ?? undefined,
            suspended: p.suspended,
        }));

        const totalSalary = mappedPlayers.reduce((sum, p) => sum + p.salary, 0);
        const leagueName = league ?? "ALL";

        return {
            league: leagueName,
            players: mappedPlayers,
            totalCount: mappedPlayers.length,
            totalSalary,
        };
    }

    /**
     * Get restricted free agents (players where teamName = 'RFA')
     */
    async getRestrictedFreeAgents(league?: string, limit: number = 50): Promise<FaListResult> {
        const safeLimit = Math.min(Math.max(limit, 1), 100);

        const query = this.playerRepo.createQueryBuilder("player")
            .where("player.teamName = :teamName", {teamName: "RFA"})
            .andWhere("player.suspended = :suspended", {suspended: false})
            .orderBy("player.salary", "DESC")
            .addOrderBy("player.name", "ASC")
            .take(safeLimit);

        if (league) {
            query.andWhere("player.league = :league", {league});
        }

        const players = await query.getMany();

        const mappedPlayers: FreeAgent[] = players.map(p => ({
            id: p.id,
            mleid: p.mleid,
            name: p.name,
            teamName: p.teamName ?? undefined,
            league: p.league ? String(p.league) : undefined,
            salary: p.salary,
            role: p.role ?? undefined,
            suspended: p.suspended,
        }));

        const totalSalary = mappedPlayers.reduce((sum, p) => sum + p.salary, 0);
        const leagueName = league ?? "ALL";

        return {
            league: leagueName,
            players: mappedPlayers,
            totalCount: mappedPlayers.length,
            totalSalary,
        };
    }

    /**
     * Get waiver claims (players where teamName = 'WAIVERS')
     */
    async getWaiverClaims(league?: string, limit: number = 50): Promise<FaListResult> {
        const safeLimit = Math.min(Math.max(limit, 1), 100);

        const query = this.playerRepo.createQueryBuilder("player")
            .where("player.teamName = :teamName", {teamName: "WAIVERS"})
            .andWhere("player.suspended = :suspended", {suspended: false})
            .orderBy("player.salary", "DESC")
            .addOrderBy("player.name", "ASC")
            .take(safeLimit);

        if (league) {
            query.andWhere("player.league = :league", {league});
        }

        const players = await query.getMany();

        const mappedPlayers: FreeAgent[] = players.map(p => ({
            id: p.id,
            mleid: p.mleid,
            name: p.name,
            teamName: p.teamName ?? undefined,
            league: p.league ? String(p.league) : undefined,
            salary: p.salary,
            role: p.role ?? undefined,
            suspended: p.suspended,
        }));

        const totalSalary = mappedPlayers.reduce((sum, p) => sum + p.salary, 0);
        const leagueName = league ?? "ALL";

        return {
            league: leagueName,
            players: mappedPlayers,
            totalCount: mappedPlayers.length,
            totalSalary,
        };
    }

    /**
     * Get all free agent categories at once
     */
    async getAllFreeAgentCategories(league?: string): Promise<{
        freeAgents: FaListResult;
        restrictedFreeAgents: FaListResult;
        waiverClaims: FaListResult;
    }> {
        const [freeAgents, restrictedFreeAgents, waiverClaims] = await Promise.all([
            this.getFreeAgents(league),
            this.getRestrictedFreeAgents(league),
            this.getWaiverClaims(league),
        ]);

        return {
            freeAgents,
            restrictedFreeAgents,
            waiverClaims,
        };
    }
}
