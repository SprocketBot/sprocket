import {BadRequestException, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {In, Repository} from "typeorm";

import {League} from "../../database/mledb";
import {MLE_Series} from "../../database/mledb/Series.model";
import {Role} from "../../database/mledb/enums/Role.enum";
import {MLE_TeamRoleUsage} from "../../database/mledb/TeamRoleUsage.model";

import type {NcpTeamRoleUsageRowInput} from "./ncp-team-role-usage.types";

/** Each logical slot row is persisted this many times for downstream accounting. */
export const NCP_TEAM_ROLE_USAGE_ROW_REPEAT = 3;

const LEAGUE_BY_ABBREV: Record<string, League> = {
    FL: League.FOUNDATION,
    AL: League.ACADEMY,
    CL: League.CHAMPION,
    ML: League.MASTER,
    PL: League.PREMIER,
};

const SLOT_LETTER_TO_ROLE: Record<string, Role> = {
    A: Role.PlayerA,
    B: Role.PlayerB,
    C: Role.PlayerC,
    D: Role.PlayerD,
    E: Role.PlayerE,
    F: Role.PlayerF,
    G: Role.PlayerG,
    H: Role.PlayerH,
};

export function normalizeLeagueAbbrev(abbrev: string): League {
    const key = abbrev.trim().toUpperCase();
    const league = LEAGUE_BY_ABBREV[key];
    if (!league) {
        throw new BadRequestException(
            `Unknown league abbreviation "${abbrev.trim()}". Expected one of: ${Object.keys(LEAGUE_BY_ABBREV).join(", ")}`,
        );
    }
    return league;
}

export function slotLetterToRole(letter: string): Role {
    const key = letter.trim().toUpperCase();
    const role = SLOT_LETTER_TO_ROLE[key];
    if (!role) {
        throw new BadRequestException(
            `Unknown slot "${letter.trim()}". Expected a single letter A–H.`,
        );
    }
    return role;
}

function normalizeSlotLetters(slots: string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const raw of slots) {
        const s = raw.trim().toUpperCase();
        if (s.length === 0) continue;
        if (seen.has(s)) continue;
        seen.add(s);
        out.push(s);
    }
    return out;
}

@Injectable()
export class MledbNcpTeamRoleUsageService {
    constructor(
        @InjectRepository(MLE_TeamRoleUsage)
        private readonly teamRoleUsageRepo: Repository<MLE_TeamRoleUsage>,
        @InjectRepository(MLE_Series)
        private readonly seriesRepo: Repository<MLE_Series>,
    ) {}

    /**
     * Inserts `mledb.team_role_usage` rows from NCP-style inputs.
     * Each slot becomes {@link NCP_TEAM_ROLE_USAGE_ROW_REPEAT} identical rows.
     */
    async importRows(rows: NcpTeamRoleUsageRowInput[], actor: string): Promise<number> {
        if (rows.length === 0) return 0;

        const seriesIds = [...new Set(rows.map(r => r.seriesId))];
        const seriesList = await this.seriesRepo.find({
            where: {id: In(seriesIds)},
        });
        if (seriesList.length !== seriesIds.length) {
            const found = new Set(seriesList.map(s => s.id));
            const missing = seriesIds.filter(id => !found.has(id));
            throw new BadRequestException(`Unknown mledb series id(s): ${missing.join(", ")}`);
        }
        const seriesById = new Map(seriesList.map(s => [s.id, s]));

        const toSave: MLE_TeamRoleUsage[] = [];

        for (const row of rows) {
            const series = seriesById.get(row.seriesId)!;
            const league = normalizeLeagueAbbrev(row.leagueAbbrev);
            const teamName = row.teamName.trim();
            if (!teamName) {
                throw new BadRequestException(`Empty team name for series ${row.seriesId}`);
            }

            const letters = normalizeSlotLetters(row.slotsUsed);
            if (letters.length === 0) {
                throw new BadRequestException(
                    `No non-empty slots for series ${row.seriesId}, team "${teamName}"`,
                );
            }

            for (const letter of letters) {
                const role = slotLetterToRole(letter);
                for (let i = 0; i < NCP_TEAM_ROLE_USAGE_ROW_REPEAT; i++) {
                    const usage = this.teamRoleUsageRepo.create({
                        teamName,
                        league,
                        role,
                        series,
                        createdBy: actor,
                        updatedBy: actor,
                    });
                    toSave.push(usage);
                }
            }
        }

        await this.teamRoleUsageRepo.save(toSave);
        return toSave.length;
    }
}
