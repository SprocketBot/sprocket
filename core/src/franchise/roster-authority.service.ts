import {Injectable, Logger} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import {FranchiseLeadershipAppointment} from "$db/franchise/franchise_leadership_appointment/franchise_leadership_appointment.model";
import {FranchiseStaffAppointment} from "$db/franchise/franchise_staff_appointment/franchise_staff_appointment.model";
import {Player} from "$db/franchise/player/player.model";
import {RosterRole} from "$db/franchise/roster_role/roster_role.model";
import {RosterSlot} from "$db/franchise/roster_slot/roster_slot.model";
import {Team} from "$db/franchise/team/team.model";
import {FranchiseLeadershipRole} from "$db/authorization/franchise_leadership_role/franchise_leadership_role.model";
import {FranchiseLeadershipSeat} from "$db/authorization/franchise_leadership_seat/franchise_leadership_seat.model";
import {FranchiseStaffRole} from "$db/authorization/franchise_staff_role/franchise_staff_role.model";
import {FranchiseStaffSeat} from "$db/authorization/franchise_staff_seat/franchise_staff_seat.model";
import {UserAuthenticationAccount} from "$db/identity/user_authentication_account/user_authentication_account.model";
import {UserAuthenticationAccountType} from "$db/identity/user_authentication_account/user_authentication_account_type.enum";

import {MLE_Player} from "../database/mledb/Player.model";
import {MLE_Team} from "../database/mledb/Team.model";
import {MLE_TeamToCaptain} from "../database/mledb/TeamToCaptain.model";
import {LeagueToSkillGroup} from "../database/mledb-bridge/league_to_skill_group.model";
import {PlayerToPlayer} from "../database/mledb-bridge/player_to_player.model";
import {TeamToFranchise} from "../database/mledb-bridge/team_to_franchise.model";

/** MLE `team.name` values that mean the player is not on a franchise roster slot in Sprocket. */
const NON_FRANCHISE_ROSTER_TEAM_NAMES = new Set([
    "FP",
    "FA",
    "Pend",
    "Waivers",
    "RFA",
]);

const ROCKET_LEAGUE_GAME_ID = 7;

const STAFF_ROLE_GM = "General Manager";
const STAFF_ROLE_AGM = "Assistant General Manager";
const STAFF_ROLE_CAPTAIN = "Captain";
const STAFF_ROLE_PR = "PR Support";
const LEADERSHIP_ROLE_FM = "Franchise Manager";

export type PlayerFranchiseRow = {
    id: number;
    name: string;
    staffPositions: Array<{id: number; name: string;}>;
};

@Injectable()
export class RosterAuthorityService {
    private readonly logger = new Logger(RosterAuthorityService.name);

    constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(MLE_Player)
    private readonly mlePlayerRepository: Repository<MLE_Player>,
    @InjectRepository(MLE_Team)
    private readonly mleTeamRepository: Repository<MLE_Team>,
    @InjectRepository(MLE_TeamToCaptain)
    private readonly mleTeamToCaptainRepository: Repository<MLE_TeamToCaptain>,
    @InjectRepository(TeamToFranchise)
    private readonly teamToFranchiseRepository: Repository<TeamToFranchise>,
    @InjectRepository(LeagueToSkillGroup)
    private readonly leagueToSkillGroupRepository: Repository<LeagueToSkillGroup>,
    @InjectRepository(PlayerToPlayer)
    private readonly playerToPlayerRepository: Repository<PlayerToPlayer>,
    @InjectRepository(RosterSlot)
    private readonly rosterSlotRepository: Repository<RosterSlot>,
    @InjectRepository(RosterRole)
    private readonly rosterRoleRepository: Repository<RosterRole>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(FranchiseStaffAppointment)
    private readonly franchiseStaffAppointmentRepository: Repository<FranchiseStaffAppointment>,
    @InjectRepository(FranchiseLeadershipAppointment)
    private readonly franchiseLeadershipAppointmentRepository: Repository<FranchiseLeadershipAppointment>,
    @InjectRepository(FranchiseStaffRole)
    private readonly franchiseStaffRoleRepository: Repository<FranchiseStaffRole>,
    @InjectRepository(FranchiseStaffSeat)
    private readonly franchiseStaffSeatRepository: Repository<FranchiseStaffSeat>,
    @InjectRepository(FranchiseLeadershipRole)
    private readonly franchiseLeadershipRoleRepository: Repository<FranchiseLeadershipRole>,
    @InjectRepository(FranchiseLeadershipSeat)
    private readonly franchiseLeadershipSeatRepository: Repository<FranchiseLeadershipSeat>,
    ) {}

    /**
     * Project MLE roster / staff / captain state into Sprocket after an MLE player row changes.
     * MLE writes remain a temporary legacy path; Sprocket tables are the read model for franchise APIs.
     */
    async syncFromMlePlayerId(mledPlayerId: number): Promise<void> {
        const mlePlayer = await this.mlePlayerRepository.findOne({where: {id: mledPlayerId} });
        if (!mlePlayer) {
            this.logger.warn(`syncFromMlePlayerId: no MLE player ${mledPlayerId}`);
            return;
        }

        const bridge = await this.playerToPlayerRepository.findOne({where: {mledPlayerId} });
        if (!bridge) {
            this.logger.debug(`syncFromMlePlayerId: no player_to_player bridge for MLE id ${mledPlayerId}`);
            return;
        }

        const fullPlayer = await this.playerRepository.findOne({
            where: {id: bridge.sprocketPlayerId},
            relations: {
                member: true,
                skillGroup: {
                    game: true,
                    organization: true,
                },
                slot: {
                    role: true,
                    team: true,
                },
            },
        });
        if (!fullPlayer) {
            this.logger.warn(`syncFromMlePlayerId: no Sprocket player ${bridge.sprocketPlayerId}`);
            return;
        }

        if (fullPlayer.skillGroup.game.id !== ROCKET_LEAGUE_GAME_ID) {
            return;
        }

        await this.syncRosterSlotFromMle(fullPlayer, mlePlayer);
        await this.syncStaffAndCaptainFromMle(fullPlayer.member.id, mlePlayer);
    }

    private async syncRosterSlotFromMle(sprocketPlayer: Player, mlePlayer: MLE_Player): Promise<void> {
        const teamName = mlePlayer.teamName?.trim() ?? "";
        if (!teamName || NON_FRANCHISE_ROSTER_TEAM_NAMES.has(teamName)) {
            await this.clearPlayerRosterSlot(sprocketPlayer.id);
            return;
        }

        const tf = await this.teamToFranchiseRepository.findOne({where: {team: teamName} });
        if (!tf) {
            this.logger.warn(
                `syncRosterSlotFromMle: no team_to_franchise for MLE team "${teamName}"; clearing roster slot for player ${sprocketPlayer.id}`,
            );
            await this.clearPlayerRosterSlot(sprocketPlayer.id);
            return;
        }

        const leagueRow = await this.leagueToSkillGroupRepository.findOne({where: {league: mlePlayer.league} });
        if (!leagueRow) {
            this.logger.warn(
                `syncRosterSlotFromMle: no league_to_skill_group for league ${mlePlayer.league}; skipping slot for player ${sprocketPlayer.id}`,
            );
            return;
        }

        const orgId = sprocketPlayer.skillGroup.organizationId;
        const franchiseTeam = await this.teamRepository.findOne({
            where: {
                franchise: {id: tf.franchiseId},
                skillGroup: {id: leagueRow.skillGroupId, organization: {id: orgId} },
            },
        });
        if (!franchiseTeam) {
            this.logger.warn(
                `syncRosterSlotFromMle: no sprocket.team for franchise ${tf.franchiseId}, skillGroup ${leagueRow.skillGroupId}, org ${orgId}`,
            );
            return;
        }

        const roleCode = mlePlayer.role?.trim();
        if (!roleCode || roleCode === "NONE") {
            await this.clearPlayerRosterSlot(sprocketPlayer.id);
            return;
        }

        const rosterRole = await this.rosterRoleRepository.findOne({
            where: {
                code: roleCode,
                skillGroup: {id: leagueRow.skillGroupId},
                organization: {id: orgId},
            },
        });
        if (!rosterRole) {
            this.logger.warn(
                `syncRosterSlotFromMle: no roster_role code=${roleCode} skillGroup=${leagueRow.skillGroupId} org=${orgId}`,
            );
            return;
        }

        const targetSlot = await this.rosterSlotRepository.findOne({
            where: {
                team: {id: franchiseTeam.id},
                role: {id: rosterRole.id},
            },
            relations: {player: true},
        });
        if (!targetSlot) {
            this.logger.warn(
                `syncRosterSlotFromMle: no roster_slot for team ${franchiseTeam.id} role ${rosterRole.code}`,
            );
            return;
        }

        if (targetSlot.player && targetSlot.player.id !== sprocketPlayer.id) {
            this.logger.warn(
                `syncRosterSlotFromMle: slot team ${franchiseTeam.id} role ${rosterRole.code} already held by player ${targetSlot.player.id}`,
            );
            return;
        }

        await this.detachPlayerFromOtherSlots(sprocketPlayer.id, targetSlot.id);

        if (!targetSlot.player || targetSlot.player.id !== sprocketPlayer.id) {
            await this.rosterSlotRepository.update(
                {id: targetSlot.id},
                {player: {id: sprocketPlayer.id} as Player},
            );
        }
    }

    private async detachPlayerFromOtherSlots(sprocketPlayerId: number, keepSlotId: number): Promise<void> {
        const occupied = await this.rosterSlotRepository.find({
            where: {player: {id: sprocketPlayerId} },
        });
        for (const slot of occupied) {
            if (slot.id === keepSlotId) continue;
            await this.rosterSlotRepository.update({id: slot.id}, {player: null});
        }
    }

    private async clearPlayerRosterSlot(sprocketPlayerId: number): Promise<void> {
        const occupied = await this.rosterSlotRepository.find({
            where: {player: {id: sprocketPlayerId} },
        });
        for (const slot of occupied) {
            await this.rosterSlotRepository.update({id: slot.id}, {player: null});
        }
    }

    private async syncStaffAndCaptainFromMle(memberId: number, mlePlayer: MLE_Player): Promise<void> {
        await this.clearFranchiseStaffForMember(memberId);

        const staffTeams = await this.mleTeamRepository.find({
            where: [
                {franchiseManagerId: mlePlayer.id},
                {generalManagerId: mlePlayer.id},
                {doublesAssistantGeneralManagerId: mlePlayer.id},
                {standardAssistantGeneralManagerId: mlePlayer.id},
                {prSupportId: mlePlayer.id},
            ],
        });

        const fmRole = await this.franchiseLeadershipRoleRepository.findOne({where: {name: LEADERSHIP_ROLE_FM} });
        const gmStaffRole = await this.franchiseStaffRoleRepository.findOne({
            where: {name: STAFF_ROLE_GM, game: {id: ROCKET_LEAGUE_GAME_ID} },
        });
        const agmStaffRole = await this.franchiseStaffRoleRepository.findOne({
            where: {name: STAFF_ROLE_AGM, game: {id: ROCKET_LEAGUE_GAME_ID} },
        });
        const captainStaffRole = await this.franchiseStaffRoleRepository.findOne({
            where: {name: STAFF_ROLE_CAPTAIN, game: {id: ROCKET_LEAGUE_GAME_ID} },
        });
        const prStaffRole = await this.franchiseStaffRoleRepository.findOne({
            where: {name: STAFF_ROLE_PR, game: {id: ROCKET_LEAGUE_GAME_ID} },
        });

        const agmSeats = agmStaffRole
            ? await this.franchiseStaffSeatRepository.find({
                where: {role: {id: agmStaffRole.id} },
                order: {id: "ASC"},
            })
            : [];

        for (const mleTeam of staffTeams) {
            const bridge = await this.teamToFranchiseRepository.findOne({where: {team: mleTeam.name} });
            if (!bridge) {
                this.logger.warn(`syncStaffAndCaptainFromMle: no franchise bridge for staff team "${mleTeam.name}"`);
                continue;
            }
            const franchiseId = bridge.franchiseId;

            if (fmRole && mleTeam.franchiseManagerId === mlePlayer.id) {
                const seat = await this.franchiseLeadershipSeatRepository.findOne({where: {role: {id: fmRole.id} } });
                if (seat) {
                    await this.franchiseLeadershipAppointmentRepository.save(
                        this.franchiseLeadershipAppointmentRepository.create({
                            franchise: {id: franchiseId} as never,
                            member: {id: memberId} as never,
                            seat,
                        }),
                    );
                }
            }
            if (gmStaffRole && mleTeam.generalManagerId === mlePlayer.id) {
                const seat = await this.franchiseStaffSeatRepository.findOne({where: {role: {id: gmStaffRole.id} } });
                if (seat) {
                    await this.franchiseStaffAppointmentRepository.save(
                        this.franchiseStaffAppointmentRepository.create({
                            franchise: {id: franchiseId} as never,
                            member: {id: memberId} as never,
                            seat,
                        }),
                    );
                }
            }
            if (agmStaffRole && agmSeats.length > 0) {
                if (mleTeam.doublesAssistantGeneralManagerId === mlePlayer.id) {
                    await this.franchiseStaffAppointmentRepository.save(
                        this.franchiseStaffAppointmentRepository.create({
                            franchise: {id: franchiseId} as never,
                            member: {id: memberId} as never,
                            seat: agmSeats[0],
                        }),
                    );
                }
                if (mleTeam.standardAssistantGeneralManagerId === mlePlayer.id) {
                    const seat = agmSeats.length > 1 ? agmSeats[1] : agmSeats[0];
                    await this.franchiseStaffAppointmentRepository.save(
                        this.franchiseStaffAppointmentRepository.create({
                            franchise: {id: franchiseId} as never,
                            member: {id: memberId} as never,
                            seat,
                        }),
                    );
                }
            }
            if (prStaffRole && mleTeam.prSupportId === mlePlayer.id) {
                const seat = await this.franchiseStaffSeatRepository.findOne({where: {role: {id: prStaffRole.id} } });
                if (seat) {
                    await this.franchiseStaffAppointmentRepository.save(
                        this.franchiseStaffAppointmentRepository.create({
                            franchise: {id: franchiseId} as never,
                            member: {id: memberId} as never,
                            seat,
                        }),
                    );
                }
            }
        }

        const captainRows = await this.mleTeamToCaptainRepository.find({where: {playerId: mlePlayer.id} });
        for (const cap of captainRows) {
            const bridge = await this.teamToFranchiseRepository.findOne({where: {team: cap.teamName} });
            if (!bridge || !captainStaffRole) continue;
            const seat = await this.franchiseStaffSeatRepository.findOne({where: {role: {id: captainStaffRole.id} } });
            if (!seat) continue;
            await this.franchiseStaffAppointmentRepository.save(
                this.franchiseStaffAppointmentRepository.create({
                    franchise: {id: bridge.franchiseId} as never,
                    member: {id: memberId} as never,
                    seat,
                }),
            );
        }
    }

    private async clearFranchiseStaffForMember(memberId: number): Promise<void> {
        await this.franchiseStaffAppointmentRepository
            .createQueryBuilder()
            .delete()
            .from(FranchiseStaffAppointment)
            .where('"memberId" = :memberId', {memberId})
            .andWhere(
                `"seatId" IN (SELECT id FROM sprocket.franchise_staff_seat WHERE "roleId" IN `
                + `(SELECT id FROM sprocket.franchise_staff_role WHERE "gameId" = :gid))`,
                {gid: ROCKET_LEAGUE_GAME_ID},
            )
            .execute();

        const fmRole = await this.franchiseLeadershipRoleRepository.findOne({where: {name: LEADERSHIP_ROLE_FM} });
        if (fmRole) {
            await this.franchiseLeadershipAppointmentRepository
                .createQueryBuilder()
                .delete()
                .from(FranchiseLeadershipAppointment)
                .where('"memberId" = :memberId', {memberId})
                .andWhere(
                    `"seatId" IN (SELECT id FROM sprocket.franchise_leadership_seat WHERE "roleId" = :roleId)`,
                    {roleId: fmRole.id},
                )
                .execute();
        }
    }

    /**
     * Franchises and staff roles for a user from Sprocket (roster_slot + appointments), populated by syncFromMlePlayerId.
     */
    async getPlayerFranchisesFromSprocket(userId: number): Promise<PlayerFranchiseRow[]> {
        const players = await this.playerRepository.find({
            where: {
                member: {user: {id: userId} },
                skillGroup: {game: {id: ROCKET_LEAGUE_GAME_ID} },
            },
            relations: {
                member: true,
                skillGroup: {game: true},
                slot: {
                    team: {
                        franchise: {profile: true},
                    },
                },
            },
        });

        if (players.length === 0) {
            return [];
        }

        const memberId = players[0].member.id;

        const staffAppts = await this.franchiseStaffAppointmentRepository.find({
            where: {member: {id: memberId} },
            relations: {
                franchise: {profile: true},
                seat: {role: true},
            },
        });

        const leadershipAppts = await this.franchiseLeadershipAppointmentRepository.find({
            where: {member: {id: memberId} },
            relations: {
                franchise: {profile: true},
                seat: {role: true},
            },
        });

        type Entry = {id: number; name: string; staffPositions: Map<string, {id: number; name: string;}>;};
        const byFranchise = new Map<number, Entry>();

        const ensure = (franchiseId: number, title: string): Entry => {
            let e = byFranchise.get(franchiseId);
            if (!e) {
                e = {id: franchiseId, name: title, staffPositions: new Map()};
                byFranchise.set(franchiseId, e);
            }
            return e;
        };

        for (const p of players) {
            const fr = p.slot?.team?.franchise;
            const title = fr?.profile?.title;
            if (fr && title) {
                ensure(fr.id, title);
            }
        }

        for (const a of staffAppts) {
            const title = a.franchise.profile?.title ?? "";
            const entry = ensure(a.franchise.id, title);
            const code = this.staffRoleNameToCode(a.seat.role.name);
            if (code) {
                entry.staffPositions.set(code, {id: a.seat.role.id, name: code});
            }
        }

        for (const a of leadershipAppts) {
            if (a.seat.role.name !== LEADERSHIP_ROLE_FM) continue;
            const title = a.franchise.profile?.title ?? "";
            const entry = ensure(a.franchise.id, title);
            entry.staffPositions.set("FM", {id: a.seat.role.id, name: "FM"});
        }

        return [...byFranchise.values()].map(v => ({
            id: v.id,
            name: v.name,
            staffPositions: [...v.staffPositions.values()],
        }));
    }

    private staffRoleNameToCode(name: string): "GM" | "AGM" | "CAP" | "PR" | null {
        if (name === STAFF_ROLE_GM) return "GM";
        if (name === STAFF_ROLE_AGM) return "AGM";
        if (name === STAFF_ROLE_CAPTAIN) return "CAP";
        if (name === STAFF_ROLE_PR || name === "PR_SUPPORT") return "PR";
        return null;
    }

    async getLeagueSuspendedFromMle(userId: number): Promise<boolean> {
        const row = await this.mlePlayerRepository
            .createQueryBuilder("p")
            .innerJoin(
                UserAuthenticationAccount,
                "uaa",
                "uaa.accountId = p.discord_id AND uaa.userId = :userId AND uaa.accountType = :atype",
                {userId, atype: UserAuthenticationAccountType.DISCORD},
            )
            .select("p.suspended", "suspended")
            .getRawOne<{suspended: boolean;}>();

        return row?.suspended === true;
    }
}
