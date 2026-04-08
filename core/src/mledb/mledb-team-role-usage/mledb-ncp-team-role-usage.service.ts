import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import { FranchiseProfile } from '$db/franchise/franchise_profile/franchise_profile.model';
import { RosterRole } from '$db/franchise/roster_role/roster_role.model';
import { RosterRoleUsage } from '$db/franchise/roster_role_usages/roster_role_usages.model';
import { RosterSlot } from '$db/franchise/roster_slot/roster_slot.model';
import { Team } from '$db/franchise/team/team.model';
import { Match } from '$db/scheduling/match/match.model';

import { League } from '../../database/mledb';
import { MLE_Series } from '../../database/mledb/Series.model';
import { Role } from '../../database/mledb/enums/Role.enum';
import { MLE_TeamRoleUsage } from '../../database/mledb/TeamRoleUsage.model';
import { SeriesToMatchParent } from '../../database/mledb-bridge/series_to_match_parent.model';

import type { NcpTeamRoleInput } from './ncp-team-role-usage.types';

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

/** Skill group `ordinal` for each MLE league string (matches `MLERL_SkillGrouptoLeagueString` ordinals). */
const LEAGUE_TO_SKILL_GROUP_ORDINAL: Record<League, number> = {
  [League.PREMIER]: 1,
  [League.MASTER]: 2,
  [League.CHAMPION]: 3,
  [League.ACADEMY]: 4,
  [League.FOUNDATION]: 5,
  [League.UNKNOWN]: -1,
};

export function normalizeLeagueAbbrev(abbrev: string): League {
  const key = abbrev.trim().toUpperCase();
  const league = LEAGUE_BY_ABBREV[key];
  if (!league) {
    throw new BadRequestException(
      `Unknown league abbreviation "${abbrev.trim()}". Expected one of: ${Object.keys(LEAGUE_BY_ABBREV).join(', ')}`,
    );
  }
  return league;
}

export function slotLetterToRole(letter: string): Role {
  const key = letter.trim().toUpperCase();
  const role = SLOT_LETTER_TO_ROLE[key];
  if (!role) {
    throw new BadRequestException(`Unknown slot "${letter.trim()}". Expected a single letter A–H.`);
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
    @InjectRepository(SeriesToMatchParent)
    private readonly seriesToMatchParentRepo: Repository<SeriesToMatchParent>,
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,
    @InjectRepository(FranchiseProfile)
    private readonly franchiseProfileRepo: Repository<FranchiseProfile>,
    @InjectRepository(Team)
    private readonly teamRepo: Repository<Team>,
    @InjectRepository(RosterRole)
    private readonly rosterRoleRepo: Repository<RosterRole>,
    @InjectRepository(RosterSlot)
    private readonly rosterSlotRepo: Repository<RosterSlot>,
    @InjectRepository(RosterRoleUsage)
    private readonly rosterRoleUsageRepo: Repository<RosterRoleUsage>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Inserts `mledb.team_role_usage` rows from NCP-style inputs (each slot repeated
   * {@link NCP_TEAM_ROLE_USAGE_ROW_REPEAT} times), and one `sprocket.roster_role_usage`
   * row per slot when franchise, team, roster role, and roster slot assignment resolve.
   */
  async importRow(row: NcpTeamRoleInput, actor: string): Promise<number> {
    const match = await this.matchRepo.findOneOrFail({
      where: { id: row.matchId },
      relations: { skillGroup: true, matchParent: true },
    });

    const bridgeRow = await this.seriesToMatchParentRepo.findOneOrFail({
      where: { matchParentId: match.matchParent.id },
    });

    const series = await this.seriesRepo.findOneOrFail({
      where: { id: bridgeRow.seriesId },
    });

    const mledbToSave: MLE_TeamRoleUsage[] = [];
    const sprocketToSave: RosterRoleUsage[] = [];

    const league = normalizeLeagueAbbrev(row.leagueAbbrev);
    const teamName = row.teamName.trim();
    if (!teamName) {
      throw new BadRequestException(`Empty team name for series ${row.matchId}`);
    }

    const seriesLeague = series.league.trim().toUpperCase();
    if (seriesLeague !== league) {
      throw new BadRequestException(
        `Series ${row.matchId} league is "${series.league}" but row has ${league} (${row.leagueAbbrev})`,
      );
    }

    const letters = normalizeSlotLetters(row.slotsUsed);
    if (letters.length === 0) {
      throw new BadRequestException(
        `No non-empty slots for series ${row.matchId}, team "${teamName}"`,
      );
    }

    const skillOrdinal = LEAGUE_TO_SKILL_GROUP_ORDINAL[league];
    if (skillOrdinal < 0) {
      throw new BadRequestException(`League ${league} cannot be mapped to a skill group`);
    }

    const franchise = await this.resolveFranchiseByTeamName(teamName);
    const team = await this.resolveTeamForFranchiseAndMatchLeague(
      franchise.id,
      skillOrdinal,
      match.skillGroup.organizationId,
    );
    if (team.skillGroup.id !== match.skillGroupId) {
      throw new BadRequestException(
        `Resolved team id ${team.id} skill group ${team.skillGroup.id} does not match ` +
          `match ${match.id} skill group ${match.skillGroupId} for series ${row.matchId}, team "${teamName}"`,
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
        mledbToSave.push(usage);
      }

      const rosterRole = await this.rosterRoleRepo.findOne({
        where: {
          code: role,
          skillGroup: { id: match.skillGroupId },
          organization: { id: match.skillGroup.organizationId },
        },
      });
      if (!rosterRole) {
        throw new BadRequestException(
          `No roster_role for code ${role}, skillGroupId ${match.skillGroupId}, ` +
            `organizationId ${match.skillGroup.organizationId} (series ${row.matchId}, "${teamName}")`,
        );
      }

      const rosterSlot = await this.rosterSlotRepo.findOne({
        where: {
          team: { id: team.id },
          role: { id: rosterRole.id },
        },
        relations: { player: true },
      });
      if (!rosterSlot?.player) {
        throw new BadRequestException(
          `No roster_slot (with player) for team id ${team.id}, roster role ${rosterRole.code} — ` +
            `series ${row.matchId}, "${teamName}", slot ${letter}`,
        );
      }

      sprocketToSave.push(
        this.rosterRoleUsageRepo.create({
          match,
          team,
          rosterRole,
          player: rosterSlot.player,
        }),
      );
    }

    await this.dataSource.transaction(async em => {
      for (const usage of mledbToSave) {
        const dup = await em.findOne(MLE_TeamRoleUsage, {
          where: {
            league: usage.league,
            teamName: usage.teamName,
            role: usage.role,
            series: usage.series,
          },
        });
        if (!dup) {
          await em.save(MLE_TeamRoleUsage, usage);
        }
      }
      await em.save(MLE_TeamRoleUsage, mledbToSave);
      for (const usage of sprocketToSave) {
        const dup = await em.findOne(RosterRoleUsage, {
          where: {
            match: { id: usage.match.id },
            team: { id: usage.team.id },
            rosterRole: { id: usage.rosterRole.id },
            player: { id: usage.player.id },
          },
        });
        if (!dup) {
          await em.save(RosterRoleUsage, usage);
        }
      }
    });

    return mledbToSave.length;
  }

  private async resolveFranchiseByTeamName(teamName: string): Promise<{ id: number }> {
    const pattern = teamName.trim();
    const profiles = await this.franchiseProfileRepo
      .createQueryBuilder('fp')
      .innerJoinAndSelect('fp.franchise', 'franchise')
      .where('LOWER(fp.title) = LOWER(:pattern)', { pattern })
      .orWhere('LOWER(fp.code) = LOWER(:pattern)', { pattern })
      .getMany();
    const franchiseIds = [...new Set(profiles.map(p => p.franchise.id))];
    if (franchiseIds.length === 0) {
      throw new BadRequestException(
        `No franchise found with profile title or code matching "${pattern}" (case-insensitive)`,
      );
    }
    if (franchiseIds.length > 1) {
      throw new BadRequestException(
        `Team name "${pattern}" matches multiple franchises (ids: ${franchiseIds.join(', ')})`,
      );
    }
    return { id: franchiseIds[0] };
  }

  private async resolveTeamForFranchiseAndMatchLeague(
    franchiseId: number,
    skillGroupOrdinal: number,
    organizationId: number,
  ): Promise<Team> {
    const team = await this.teamRepo.findOne({
      where: {
        franchise: { id: franchiseId },
        skillGroup: {
          ordinal: skillGroupOrdinal,
          organizationId,
        },
      },
      relations: { skillGroup: true, franchise: true },
    });
    if (!team) {
      throw new BadRequestException(
        `No sprocket.team for franchise id ${franchiseId}, skill group ordinal ${skillGroupOrdinal}, ` +
          `organization id ${organizationId}`,
      );
    }
    return team;
  }
}
