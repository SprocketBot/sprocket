import {Injectable, Logger} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {QueryRunner} from "typeorm";
import {DataSource, Repository} from "typeorm";

import {PlayerToPlayer} from "$bridge/player_to_player.model";
import {PlayerToUser} from "$bridge/player_to_user.model";
import type {ModePreference, Timezone} from "$mledb";
import {League, LeagueOrdinals, MLE_Player, MLE_PlayerAccount, MLE_Team, MLE_TeamToCaptain, Role} from "$mledb";
import {
    GameSkillGroupRepository,
    MemberProfiledRepository,
    OrganizationRepository,
    PlayerRepository,
    UserAuthenticationAccountRepository,
    UserProfiledRepository,
} from "$repositories";
import {UserAuthenticationAccountType} from "$types";

import {EloConnectorService, EloEndpoint} from "../../elo/elo-connector";
import type {IntakePlayerAccount} from "./mledb-player.resolver";

@Injectable()
export class MledbPlayerService {
    private readonly logger = new Logger(MledbPlayerService.name);

    constructor(
        @InjectRepository(MLE_Player)
        private readonly playerRepository: Repository<MLE_Player>,
        @InjectRepository(MLE_Team)
        private readonly teamRepo: Repository<MLE_Team>,
        @InjectRepository(MLE_TeamToCaptain)
        private readonly teamToCaptainRepo: Repository<MLE_TeamToCaptain>,
        @InjectRepository(PlayerToUser)
        private readonly ptuRepo: Repository<PlayerToUser>,
        @InjectRepository(PlayerToPlayer)
        private readonly ptpRepo: Repository<PlayerToPlayer>,
        @InjectRepository(MLE_PlayerAccount)
        private readonly playerAccountRepository: Repository<MLE_PlayerAccount>,
        private readonly sprocketUserAuthAccRepository: UserAuthenticationAccountRepository,
        private readonly sprocketSkillGroupRepository: GameSkillGroupRepository,
        private readonly sprocketOrganizationRepository: OrganizationRepository,
        private readonly sprocketPlayerRepository: PlayerRepository,
        private readonly sprocketMemberProfiledRepository: MemberProfiledRepository,
        private readonly sprocketUserProfiledRepository: UserProfiledRepository,
        private readonly dataSource: DataSource,
        private readonly eloConnectorService: EloConnectorService,
    ) {}

    async getMlePlayerBySprocketUser(userId: number): Promise<MLE_Player> {
        const discordAccount = await this.sprocketUserAuthAccRepository.getDiscordAccountByUserId(userId);
        return this.playerRepository.findOneOrFail({
            where: {
                discordId: discordAccount.accountId,
            },
        });
    }

    async getPlayerFranchise(id: number): Promise<MLE_Team> {
        const player = await this.playerRepository.findOneOrFail({where: {id}});
        return this.teamRepo.findOneOrFail({
            where: {
                name: player.teamName,
            },
        });
    }

    async playerIsCaptain(id: number): Promise<boolean> {
        const player = await this.playerRepository.findOneOrFail({where: {id}});
        const ttc = await this.teamToCaptainRepo.find({
            where: {
                teamName: player.teamName,
                playerId: player.id,
            },
        });
        return ttc.length > 0;
    }

    async getMlePlayerBySprocketPlayer(playerId: number): Promise<MLE_Player> {
        const bridge = await this.ptpRepo.findOneOrFail({where: {sprocketPlayerId: playerId}});
        return this.playerRepository.findOneOrFail({
            where: {id: bridge.mledPlayerId},
        });
    }

    async playerIsFormerPlayer(sprocketPlayerId: number): Promise<boolean> {
        const player = await this.getMlePlayerBySprocketPlayer(sprocketPlayerId);
        return player.teamName === "FP";
    }

    async getLeagueFromSkillGroupId(skillGroupId: number): Promise<League> {
        const skillGroup = await this.sprocketSkillGroupRepository.getById(skillGroupId, {relations: {profile: true}});

        if (skillGroup.profile.code === "FL") return League.FOUNDATION;
        if (skillGroup.profile.code === "AL") return League.ACADEMY;
        if (skillGroup.profile.code === "CL") return League.CHAMPION;
        if (skillGroup.profile.code === "ML") return League.MASTER;
        if (skillGroup.profile.code === "PL") return League.PREMIER;
        throw new Error("Unknown League");
    }

    async movePlayerToLeague(sprocketPlayerId: number, skillGroupId: number, salary: number): Promise<MLE_Player> {
        const league = await this.getLeagueFromSkillGroupId(skillGroupId);

        let player = await this.getMlePlayerBySprocketPlayer(sprocketPlayerId);
        player = this.playerRepository.merge(player, {league, salary});

        return player;
    }

    async movePlayerToWaivers(sprocketPlayerId: number): Promise<MLE_Player> {
        let player = await this.getMlePlayerBySprocketPlayer(sprocketPlayerId);
        player = this.playerRepository.merge(player, {
            teamName: "Waivers",
            role: Role.NONE,
        });

        return player;
    }

    async movePlayerToInactiveRoster(sprocketPlayerId: number): Promise<MLE_Player> {
        let player = await this.getMlePlayerBySprocketPlayer(sprocketPlayerId);
        player = this.playerRepository.merge(player, {
            role: Role.NONE,
        });

        return player;
    }

    async createPlayer(
        sprocketUserId: number,
        sprocketPlayerId: number,
        mleid: number,
        discordId: string,
        name: string,
        league: League,
        salary: number,
        platform: string,
        timezone: Timezone,
        preference: ModePreference,
        accounts: IntakePlayerAccount[],
        runner?: QueryRunner,
    ): Promise<MLE_Player> {
        let player: MLE_Player = {
            createdBy: "Sprocket FA Intake",
            updatedBy: "Sprocket FA Intake",
            mleid: mleid,
            name: name,
            salary: salary,
            league: league,
            preferredPlatform: platform,
            peakMmr: 0,
            timezone: timezone,
            discordId: discordId,
            modePreference: preference,
            teamName: "Pend",
        } as MLE_Player;

        player = this.playerRepository.create(player);

        const playerAccounts = accounts.map(a => {
            const acc = this.playerAccountRepository.create(a);
            acc.player = player;

            return acc;
        });

        if (runner) {
            await runner.manager.save(player);
            await runner.manager.save(playerAccounts);
        } else {
            await this.playerRepository.save(player);
            await this.playerAccountRepository.save(playerAccounts);
        }

        const ptuBridge = this.ptuRepo.create({
            userId: sprocketUserId,
            playerId: player.id,
        });

        const ptpBridge = this.ptpRepo.create({
            sprocketPlayerId: sprocketPlayerId,
            mledPlayerId: player.id,
        });

        if (runner) {
            await runner.manager.save(ptuBridge);
            await runner.manager.save(ptpBridge);
        } else {
            await this.ptuRepo.save(ptuBridge);
            await this.ptpRepo.save(ptpBridge);
        }

        return player;
    }

    async updatePlayer(
        player: MLE_Player,
        name: string,
        league: League,
        salary: number,
        platform: string,
        timezone: Timezone,
        preference: ModePreference,
        accounts: IntakePlayerAccount[],
        runner?: QueryRunner,
    ): Promise<MLE_Player> {
        const updatedPlayer = this.playerRepository.merge(player, {
            updatedBy: "Sprocket FA Intake",
            name: name,
            salary: salary,
            league: league,
            preferredPlatform: platform,
            timezone: timezone,
            modePreference: preference,
            teamName: "Pend",
            role: Role.NONE,
        });

        const playerAccounts: MLE_PlayerAccount[] = [];
        await Promise.all(
            accounts.map(async a => {
                const currAcc = await this.playerAccountRepository.findOne({
                    where: [
                        {
                            platform: a.platform,
                            platformId: a.platformId,
                            player: {
                                id: player.id,
                            },
                        },
                        {
                            tracker: a.tracker,
                            player: {
                                id: player.id,
                            },
                        },
                    ],
                    relations: {
                        player: true,
                    },
                });
                if (currAcc) return;

                const acc = this.playerAccountRepository.create(a);
                acc.player = player;

                playerAccounts.push(acc);
            }),
        );

        if (runner) {
            await runner.manager.save(player);
            await runner.manager.save(playerAccounts);
        } else {
            await this.playerRepository.save(player);
            await this.playerAccountRepository.save(playerAccounts);
        }

        return updatedPlayer;
    }

    async intakePlayer(
        mleid: number,
        discordId: string,
        name: string,
        skillGroupId: number,
        salary: number,
        platform: string,
        platforms: IntakePlayerAccount[],
        timezone: Timezone,
        modePreference: ModePreference,
    ): Promise<MLE_Player> {
        const mleOrg = await this.sprocketOrganizationRepository.getByName("Minor League Esports");
        const skillGroup = await this.sprocketSkillGroupRepository.getById(skillGroupId);

        const runner = this.dataSource.createQueryRunner();
        await runner.connect();
        await runner.startTransaction();

        let mlePlayer: MLE_Player | null;

        try {
            mlePlayer = await this.playerRepository.findOne({where: {mleid}});

            if (mlePlayer) {
                const bridge = await this.ptpRepo.findOneOrFail({where: {mledPlayerId: mlePlayer.id}});
                let player = await this.sprocketPlayerRepository.findOneOrFail({
                    where: {id: bridge.sprocketPlayerId},
                    relations: {member: {user: true, profile: true}},
                });

                player = this.sprocketPlayerRepository.merge(player, {skillGroup, salary});
                this.sprocketMemberProfiledRepository.profileRepository.merge(player.member.profile, {name});

                await runner.manager.save(player);
                await runner.manager.save(player.member.profile);
                await this.updatePlayer(
                    mlePlayer,
                    name,
                    LeagueOrdinals[skillGroup.ordinal - 1],
                    salary,
                    platform,
                    timezone,
                    modePreference,
                    platforms,
                    runner,
                );

                if (skillGroup.id !== player.skillGroupId)
                    await this.eloConnectorService.createJob(EloEndpoint.SGChange, {
                        id: player.id,
                        salary: salary,
                        skillGroup: skillGroup.ordinal,
                    });
            } else {
                const user = this.sprocketUserProfiledRepository.primaryRepository.create({});

                user.profile = this.sprocketUserProfiledRepository.profileRepository.create({
                    user: user,
                    email: "unknown@sprocket.gg",
                    displayName: name,
                });
                user.profile.user = user;

                const authAcc = this.sprocketUserAuthAccRepository.create({
                    accountType: UserAuthenticationAccountType.DISCORD,
                    accountId: discordId,
                });
                authAcc.user = user;
                user.authenticationAccounts = [authAcc];

                const member = this.sprocketMemberProfiledRepository.primaryRepository.create({});
                member.organization = mleOrg;
                member.user = user;
                member.profile = this.sprocketMemberProfiledRepository.profileRepository.create({
                    name: name,
                });
                member.profile.member = member;

                const player = this.sprocketPlayerRepository.create({salary});
                player.member = member;
                player.skillGroup = skillGroup;

                await runner.manager.save(user);
                await runner.manager.save(user.profile);
                await runner.manager.save(user.authenticationAccounts);
                await runner.manager.save(member);
                await runner.manager.save(member.profile);
                await runner.manager.save(player);
                mlePlayer = await this.createPlayer(
                    user.id,
                    player.id,
                    mleid,
                    discordId,
                    name,
                    LeagueOrdinals[skillGroup.ordinal - 1],
                    salary,
                    platform,
                    timezone,
                    modePreference,
                    platforms,
                    runner,
                );

                await this.eloConnectorService.createJob(EloEndpoint.AddPlayerBySalary, {
                    id: player.id,
                    name: name,
                    salary: salary,
                    skillGroup: skillGroup.ordinal,
                });
            }

            await runner.commitTransaction();
        } catch (e) {
            await runner.rollbackTransaction();
            this.logger.error(e);
            throw e;
        } finally {
            await runner.release();
        }

        return mlePlayer;
    }
}
