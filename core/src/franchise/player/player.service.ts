import {
    forwardRef, Inject, Injectable, Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import type {
    CoreEndpoint,
    CoreOutput,
    NotificationInput,
} from "@sprocketbot/common";
import {
    ButtonComponentStyle,
    ComponentType,
    config,
    EventsService,
    EventTopic,
    NotificationEndpoint,
    NotificationMessageType,
    NotificationService,
    NotificationType,
} from "@sprocketbot/common";
import type {
    FindManyOptions, FindOneOptions, FindOptionsRelations, QueryRunner,
} from "typeorm";
import { DataSource, Repository } from "typeorm";

import { Player } from "../../database/franchise/player/player.model";
import { User } from "../../database/identity/user/user.model";
import { UserAuthenticationAccount } from "../../database/identity/user_authentication_account/user_authentication_account.model";
import { UserAuthenticationAccountType } from "../../database/identity/user_authentication_account/user_authentication_account_type.enum";
import { UserProfile } from "../../database/identity/user_profile/user_profile.model";
import { Member } from "../../database/organization/member/member.model";
import { MemberProfile } from "../../database/organization/member_profile/member_profile.model";
import { Organization } from "../../database/organization/organization/organization.model";

import {
    League,
    LeagueOrdinals,
    ModePreference,
    Role,
    Timezone,
} from "../../database/mledb";
import { MLE_Player } from "../../database/mledb/Player.model";
import { MLE_PlayerAccount } from "../../database/mledb/PlayerAccount.model";
import { PlayerToPlayer } from "../../database/mledb-bridge/player_to_player.model";
import { PlayerToUser } from "../../database/mledb-bridge/player_to_user.model";
import type { SalaryPayloadItem } from "../../elo/elo-connector";
import {
    DegreeOfStiffness,
    EloConnectorService,
    EloEndpoint,
    SkillGroupDelta,
} from "../../elo/elo-connector";
import { PlatformService } from "../../game";
import { OrganizationService } from "../../organization";
import { MemberService } from "../../organization/member/member.service";
import { GameSkillGroupService } from "../game-skill-group";
import type { RankdownJwtPayload } from "./player.types";
import type { CreatePlayerTuple } from "./player.types";

@Injectable()
export class PlayerService {
    private readonly logger = new Logger(PlayerService.name);

    constructor(
        @InjectRepository(Player) private playerRepository: Repository<Player>,
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(UserProfile) private userProfileRepository: Repository<UserProfile>,
        @InjectRepository(Member) private memberRepository: Repository<Member>,
        @InjectRepository(MemberProfile) private memberProfileRepository: Repository<MemberProfile>,
        @InjectRepository(UserAuthenticationAccount) private userAuthRepository: Repository<UserAuthenticationAccount>,
        @InjectRepository(Organization) private organizationRepository: Repository<Organization>,
        @InjectRepository(PlayerToUser) private readonly ptuRepo: Repository<PlayerToUser>,
        @InjectRepository(PlayerToPlayer) private readonly ptpRepo: Repository<PlayerToPlayer>,
        @InjectRepository(MLE_Player) private mle_playerRepository: Repository<MLE_Player>,
        @InjectRepository(MLE_PlayerAccount) private mle_playerAccountRepository: Repository<MLE_PlayerAccount>,
        @Inject(forwardRef(() => MemberService)) private readonly memberService: MemberService,
        @Inject(forwardRef(() => OrganizationService)) private readonly organizationService: OrganizationService,
        private readonly skillGroupService: GameSkillGroupService,
        private readonly eventsService: EventsService,
        private readonly notificationService: NotificationService,
        private readonly jwtService: JwtService,
        private readonly dataSource: DataSource,
        private readonly eloConnectorService: EloConnectorService,
        private readonly platformService: PlatformService,
    ) { }

    async getPlayer(query: FindOneOptions<Player>): Promise<Player> {
        this.logger.verbose(`getPlayer: ${JSON.stringify(query)}`);
        return this.playerRepository.findOneOrFail(query);
    }

    async getPlayerById(id: number): Promise<Player> {
        this.logger.verbose(`getPlayerById: ${id}`);
        return this.playerRepository.findOneOrFail({ where: { id } });
    }

    async getPlayerByOrganizationAndGame(userId: number, organizationId: number, gameId: number): Promise<Player> {
        this.logger.verbose(`getPlayerByOrganizationAndGame: userId=${userId}, orgId=${organizationId}, gameId=${gameId}`);
        return this.playerRepository.findOneOrFail({
            where: {
                member: {
                    user: {
                        id: userId,
                    },
                    organization: {
                        id: organizationId,
                    },
                },
                skillGroup: {
                    game: {
                        id: gameId,
                    },
                },
            },
            relations: ["member", "skillGroup"],
        });
    }

    async getPlayerByOrganizationAndGameMode(userId: number, organizationId: number, gameModeId: number): Promise<Player> {
        this.logger.verbose(`getPlayerByOrganizationAndGameMode: userId=${userId}, orgId=${organizationId}, gameModeId=${gameModeId}`);
        return this.playerRepository.findOneOrFail({
            where: {
                member: {
                    user: {
                        id: userId,
                    },
                    organization: {
                        id: organizationId,
                    },
                },
                skillGroup: {
                    game: {
                        modes: {
                            id: gameModeId,
                        },
                    },
                },
            },
            relations: {
                member: {
                    user: true,
                    organization: true,
                },
                skillGroup: {
                    game: {
                        modes: true,
                    },
                },
            },
        });
    }

    async getPlayers(query?: FindManyOptions<Player>): Promise<Player[]> {
        this.logger.verbose(`getPlayers: ${JSON.stringify(query)}`);
        return this.playerRepository.find(query);
    }

    async createPlayer(memberOrId: number | Member, skillGroupId: number, salary: number, runner?: QueryRunner): Promise<Player> {
        this.logger.verbose(`createPlayer: memberOrId=${typeof memberOrId === "number" ? memberOrId : memberOrId.id}, skillGroupId=${skillGroupId}, salary=${salary}`);
        let member: Member;
        if (typeof memberOrId === "number") {
            member = await this.memberService.getMemberById(memberOrId);
        } else {
            member = memberOrId;
        }

        const skillGroup = await this.skillGroupService.getGameSkillGroupById(skillGroupId);
        const player = this.playerRepository.create({
            member, skillGroup, salary,
        });

        if (runner) {
            await runner.manager.save(player);
        } else {
            await this.playerRepository.save(player);
        }

        await this.checkAndCreateMlePlayer(player, member.user.id, skillGroup.id, runner);

        return player;
    }

    async checkAndCreateMlePlayer(player: Player, userId: number, skillGroupId: number, runner?: QueryRunner): Promise<void> {
        const skillGroup = await this.skillGroupService.getGameSkillGroup({
            where: { id: skillGroupId },
            relations: { game: true },
        });
        if (skillGroup.game.id !== 7) return;

        let userAuth: UserAuthenticationAccount | null;
        if (runner) {
            userAuth = await runner.manager.findOne(UserAuthenticationAccount, {
                where: {
                    user: { id: userId },
                    accountType: UserAuthenticationAccountType.DISCORD,
                },
                relations: { user: { profile: true } },
            });
        } else {
            userAuth = await this.userAuthRepository.findOne({
                where: {
                    user: { id: userId },
                    accountType: UserAuthenticationAccountType.DISCORD,
                },
                relations: { user: { profile: true } },
            });
        }

        if (!userAuth) {
            this.logger.warn(`Could not find discord account for user ${userId}, skipping MLE player creation`);
            return;
        }

        await this.mle_createPlayer(
            player.id,
            userAuth.accountId,
            userAuth.user.profile.displayName,
            player.salary,
            LeagueOrdinals[skillGroup.ordinal - 1],
            "PC",
            Timezone.US_EAST,
            ModePreference.BOTH,
            runner,
        );
    }

    /* !! Using repositories due to circular dependency issues. Will fix after extended repositories are added, probably. !! */
    async updatePlayer(
        mleid: number,
        name: string,
        skillGroupId: number,
        salary: number,
        platform: string,
        timezone: Timezone,
        modePreference: ModePreference,
    ): Promise<Player> {
        this.logger.verbose(`updatePlayer: mleid=${mleid}, name=${name}, skillGroupId=${skillGroupId}, salary=${salary}`);
        const skillGroup = await this.skillGroupService.getGameSkillGroupById(skillGroupId);

        const runner = this.dataSource.createQueryRunner();
        await runner.connect();
        await runner.startTransaction();

        let player: Player;

        try {
            const mlePlayer = await this.mle_playerRepository.findOne({ where: { mleid } });

            if (mlePlayer) {
                const bridge = await this.ptpRepo.findOneOrFail({ where: { mledPlayerId: mlePlayer.id } });
                player = await this.playerRepository.findOneOrFail({
                    where: { id: bridge.sprocketPlayerId },
                    relations: { member: { user: true, profile: true } },
                });

                player = this.playerRepository.merge(player, { skillGroupId: skillGroup.id, salary: salary });
                this.memberProfileRepository.merge(player.member.profile, { name });

                await runner.manager.save(player);
                await runner.manager.save(player.member.profile);
                await this.mle_updatePlayer(
                    mlePlayer,
                    name,
                    LeagueOrdinals[skillGroup.ordinal - 1],
                    salary,
                    platform,
                    timezone,
                    modePreference,
                    runner,
                );

                await this.eloConnectorService.createJob(EloEndpoint.SGChange, {
                    id: player.id,
                    salary: salary,
                    skillGroup: skillGroup.ordinal,
                });
            } else {
                // Throw an error, because this is an update
                throw new Error(`Tried updating player with MLEID: ${mleid}, but that MLEID does not yet exist.`);
            }
            await runner.commitTransaction();
        } catch (e) {
            await runner.rollbackTransaction();
            this.logger.error(e);
            throw e;
        } finally {
            await runner.release();
        }

        return player;
    }


    async mle_updatePlayer(
        player: MLE_Player,
        name: string,
        league: League,
        salary: number,
        platform: string,
        timezone: Timezone,
        preference: ModePreference,
        runner?: QueryRunner,
    ): Promise<MLE_Player> {
        this.logger.verbose(`mle_updatePlayer: player=${player.id}, name=${name}, league=${league}, salary=${salary}`);
        const updatedPlayer = this.mle_playerRepository.merge(player, {
            updatedBy: "Sprocket FA Intake",
            updatedAt: new Date(),
            name: name,
            salary: salary,
            league: league,
            preferredPlatform: platform,
            timezone: timezone,
            modePreference: preference,
            teamName: "Pend",
            role: Role.NONE,
        });

        if (runner) {
            await runner.manager.save(player);
        } else {
            await this.mle_playerRepository.save(player);
        }

        return updatedPlayer;
    }

    async mle_createPlayer(
        sprocketPlayerId: number,
        discordId: string,
        name: string,
        salary: number,
        league: League = League.FOUNDATION,
        platform: string = "PC",
        timezone: Timezone = Timezone.US_EAST,
        preference: ModePreference = ModePreference.BOTH,
        runner?: QueryRunner,
    ): Promise<MLE_Player> {
        this.logger.verbose(`mle_createPlayer: sprocketPlayerId=${sprocketPlayerId}, discordId=${discordId}, name=${name}, salary=${salary}`);
        let player: MLE_Player = {
            createdBy: "Sprocket FA Intake",
            updatedBy: "Sprocket FA Intake",
            name: name,
            salary: salary,
            league: league,
            preferredPlatform: platform,
            peakMmr: 0,
            timezone: timezone,
            discordId: discordId,
            modePreference: preference,
            teamName: "Pend",
            role: "NONE",
        } as MLE_Player;

        const result = await this.mle_playerRepository
            .createQueryBuilder("player")
            .select("MAX(player.mleid)", "max")
            .getRawOne<{ max: number | null }>();

        player.mleid = (result?.max ?? 0) + 1;

        player = this.mle_playerRepository.create(player);

        if (runner) {
            await runner.manager.save(player);
        } else {
            await this.mle_playerRepository.save(player);
        }

        const ptpBridge = this.ptpRepo.create({
            sprocketPlayerId: sprocketPlayerId,
            mledPlayerId: player.id,
        });

        if (runner) {
            await runner.manager.save(ptpBridge);
        } else {
            await this.ptpRepo.save(ptpBridge);
        }

        return player;
    }

    async updatePlayerStanding(playerId: number, salary: number, skillGroupId?: number): Promise<Player> {
        this.logger.verbose(`updatePlayerStanding: playerId=${playerId}, salary=${salary}, skillGroupId=${skillGroupId}`);
        let player = await this.playerRepository.findOneOrFail({ where: { id: playerId } });

        if (skillGroupId) {
            const skillGroup = await this.skillGroupService.getGameSkillGroupById(skillGroupId);

            player = this.playerRepository.merge(player, { salary, skillGroup });
            await this.playerRepository.save(player);
        } else {
            player = this.playerRepository.merge(player, { salary });
            await this.playerRepository.save(player);
        }

        return player;
    }

    buildRankdownNotification(
        userId: number,
        discordId: string,
        orgId: number,
        orgName: string,
        oldSkillGroupName: string,
        newSkillGroupName: string,
        salary: number,
    ): NotificationInput<NotificationEndpoint.SendNotification> {
        return {
            type: NotificationType.BASIC,
            userId: userId,
            notification: {
                type: NotificationMessageType.DirectMessage,
                userId: discordId,
                payload: {
                    embeds: [{
                        title: "You Have Ranked Out",
                        description: `You have been ranked out from ${oldSkillGroupName} to ${newSkillGroupName}.`,
                        author: {
                            name: `${orgName}`,
                        },
                        fields: [
                            {
                                name: "New League",
                                value: `${newSkillGroupName}`,
                            },
                            {
                                name: "New Salary",
                                value: `${salary}`,
                            },
                        ],
                        footer: {
                            text: orgName,
                        },
                        timestamp: Date.now(),
                    }],
                },
                brandingOptions: {
                    organizationId: orgId,
                    options: {
                        author: {
                            icon: true,
                        },
                        color: true,
                        thumbnail: true,
                        footer: {
                            icon: true,
                        },
                    },
                },
            },
        };
    }

    async saveSalaries(payload: SalaryPayloadItem[][]): Promise<void> {
        this.logger.verbose(`saveSalaries: ${JSON.stringify(payload)}`);
        await Promise.allSettled(payload.map(async payloadSkillGroup => Promise.allSettled(payloadSkillGroup.map(async playerDelta => {
            const player = await this.getPlayer({
                where: { id: playerDelta.playerId },
                relations: {
                    member: {
                        user: {
                            authenticationAccounts: true,
                        },
                        organization: true,
                        profile: true,
                    },
                    skillGroup: {
                        organization: true,
                        game: true,
                        profile: true,
                    },
                },
            });

            const bridge = await this.ptpRepo.findOneOrFail({ where: { sprocketPlayerId: player.id } });
            const mlePlayer = await this.mle_playerRepository.findOneOrFail({ where: { id: bridge.mledPlayerId } });

            if (mlePlayer.teamName === "FP") return;
            if (!playerDelta.rankout && player.salary === playerDelta.newSalary) return;

            const discordAccount = await this.userAuthRepository.findOneOrFail({
                where: {
                    user: {
                        id: player.member.user.id,
                    },
                    accountType: UserAuthenticationAccountType.DISCORD,
                },
            });
            const orgProfile = await this.organizationService.getOrganizationProfileForOrganization(player.member.organization.id);

            if (playerDelta.rankout) {
                if (playerDelta.rankout.degreeOfStiffness === DegreeOfStiffness.HARD) {
                    const skillGroup = await this.skillGroupService.getGameSkillGroup({
                        where: {
                            game: {
                                id: player.skillGroup.game.id,
                            },
                            organization: {
                                id: player.skillGroup.organization.id,
                            },
                            ordinal: player.skillGroup.ordinal - (playerDelta.rankout.skillGroupChange === SkillGroupDelta.UP ? 1 : -1),
                        },
                        relations: {
                            profile: true,
                            game: true,
                            organization: true,
                        },
                    });

                    await this.updatePlayerStanding(playerDelta.playerId, playerDelta.rankout.salary, skillGroup.id);

                    if (playerDelta.rankout.skillGroupChange === SkillGroupDelta.UP) {
                        await this.mle_rankUpPlayer(player.id, playerDelta.rankout.salary);
                    } else {
                        await this.mle_rankDownPlayer(player.id, playerDelta.rankout.salary);
                    }

                    await this.eventsService.publish(EventTopic.PlayerSkillGroupChanged, {
                        playerId: player.id,
                        name: player.member.profile.name,
                        organizationId: skillGroup.organization.id,
                        discordId: discordAccount.accountId,
                        old: {
                            id: player.skillGroup.id,
                            name: player.skillGroup.profile.description,
                            salary: player.salary,
                            discordEmojiId: player.skillGroup.profile.discordEmojiId,
                        },
                        new: {
                            id: skillGroup.id,
                            name: skillGroup.profile.description,
                            salary: playerDelta.rankout.salary,
                            discordEmojiId: skillGroup.profile.discordEmojiId,
                        },
                    });

                    await this.notificationService.send(NotificationEndpoint.SendNotification, this.buildRankdownNotification(
                        player.member.user.id,
                        discordAccount.accountId,
                        player.member.organization.id,
                        orgProfile.name,
                        player.skillGroup.profile.description,
                        skillGroup.profile.description,
                        playerDelta.rankout.salary,
                    ));
                } else if (playerDelta.rankout.degreeOfStiffness === DegreeOfStiffness.SOFT) {
                    await this.updatePlayerStanding(playerDelta.playerId, playerDelta.newSalary);

                    const skillGroup = await this.skillGroupService.getGameSkillGroup({
                        where: {
                            game: {
                                id: player.skillGroup.game.id,
                            },
                            organization: {
                                id: player.skillGroup.organization.id,
                            },
                            ordinal: player.skillGroup.ordinal - (playerDelta.rankout.skillGroupChange === SkillGroupDelta.UP ? 1 : -1),
                        },
                        relations: {
                            profile: true,
                            organization: true,
                            game: true,
                        },
                    });

                    /* TEMPORARY NOTIFICATION */
                    const rankdownPayload: RankdownJwtPayload = {
                        playerId: player.id,
                        salary: playerDelta.rankout.salary,
                        skillGroupId: skillGroup.id,
                    };
                    const jwt = this.jwtService.sign(rankdownPayload, { expiresIn: "24h" });

                    await this.notificationService.send(NotificationEndpoint.SendNotification, {
                        type: NotificationType.BASIC,
                        userId: player.member.user.id,
                        notification: {
                            type: NotificationMessageType.DirectMessage,
                            userId: discordAccount.accountId,
                            payload: {
                                embeds: [{
                                    title: "Rankdown Available",
                                    description: `You have been offered a rankout from ${player.skillGroup.profile.description} to ${skillGroup.profile.description}.\n\nThis offer will expire in 24 hours.\n‼️‼️**__Only click the button below if you accept the rankdown. There is no confirmation.__**‼️‼️`,
                                    author: {
                                        name: `${orgProfile.name}`,
                                    },
                                    fields: [
                                        {
                                            name: "New League",
                                            value: `${skillGroup.profile.description}`,
                                        },
                                        {
                                            name: "New Salary",
                                            value: `${playerDelta.rankout.salary}`,
                                        },
                                    ],
                                    footer: {
                                        text: orgProfile.name,
                                    },
                                    timestamp: Date.now(),
                                }],
                                components: [{
                                    type: ComponentType.ACTION_ROW,
                                    components: [
                                        {
                                            type: ComponentType.BUTTON,
                                            style: ButtonComponentStyle.LINK,
                                            label: "ONLY CLICK HERE IF YOU ACCEPT",
                                            url: `${config.web.api_root}/player/accept-rankdown/${jwt}`,
                                        },
                                    ],
                                }],
                            },
                            brandingOptions: {
                                organizationId: player.member.organization.id,
                                options: {
                                    author: {
                                        icon: true,
                                    },
                                    color: true,
                                    thumbnail: true,
                                    footer: {
                                        icon: true,
                                    },
                                },
                            },
                        },
                    });
                    /* /TEMPORARY NOTIFICATION/ */

                    // const notifId = `${NotificationType.RANKDOWN.toLowerCase()}-${this.nanoidService.gen()}`;

                    // await this.notificationService.send(NotificationEndpoint.SendNotification, {
                    //     id: notifId,
                    //     type: NotificationType.RANKDOWN,
                    //     userId: player.member.user.id,
                    //     expiration: add(new Date(), {hours: 24}),
                    //     payload: {
                    //         playerId: playerDelta.playerId,
                    //         skillGroupId: skillGroup.id,
                    //         salary: playerDelta.newSalary,
                    //     },
                    //     notification: {
                    //         type: NotificationMessageType.DirectMessage,
                    //         userId: discordAccount.accountId,
                    //         payload: {
                    //             embeds: [ {
                    //                 title: "Rankdown Available",
                    //                 description: `You have been offered a rankout from ${player.skillGroup.profile.description} to ${skillGroup.profile.description}.`,
                    //                 author: {
                    //                     name: `${orgProfile.name}`,
                    //                 },
                    //                 fields: [
                    //                     {
                    //                         name: "New League",
                    //                         value: `${skillGroup.profile.description}`,
                    //                     },
                    //                     {
                    //                         name: "New Salary",
                    //                         value: `${playerDelta.rankout.salary}`,
                    //                     },
                    //                 ],
                    //                 footer: {
                    //                     text: orgProfile.name,
                    //                 },
                    //                 timestamp: Date.now(),
                    //             } ],
                    //             components: [ {
                    //                 type: ComponentType.ACTION_ROW,
                    //                 components: [
                    //                     {
                    //                         type: ComponentType.BUTTON,
                    //                         style: ButtonComponentStyle.LINK,
                    //                         label: "Accept it here!",
                    //                         url: `${config.web.url}/notifications/${notifId}`,
                    //                     },
                    //                 ],
                    //             } ],
                    //         },
                    //         brandingOptions: {
                    //             organizationId: player.member.organization.id,
                    //             options: {
                    //                 author: {
                    //                     icon: true,
                    //                 },
                    //                 color: true,
                    //                 thumbnail: true,
                    //                 footer: {
                    //                     icon: true,
                    //                 },
                    //             },
                    //         },
                    //     },
                    // });
                }
            } else {
                await this.updatePlayerStanding(playerDelta.playerId, playerDelta.newSalary);
                const newMlePlayer = this.mle_playerRepository.merge(mlePlayer, {
                    salary: playerDelta.newSalary,
                });

                await this.mle_playerRepository.save(newMlePlayer);
            }
        }))));
    }

    mle_nextLeague(league: League, dir: -1 | 1): League {
        return LeagueOrdinals[LeagueOrdinals.indexOf(league) - dir];
    }

    async mle_movePlayerToLeague(sprocPlayerId: number, salary: number, skillGroupId: number): Promise<MLE_Player> {
        this.logger.verbose(`mle_movePlayerToLeague: sprocPlayerId=${sprocPlayerId}, salary=${salary}, skillGroupId=${skillGroupId}`);
        const sprocketPlayer = await this.getPlayer({
            where: { id: sprocPlayerId },
            relations: {
                member: {
                    profile: true,
                    user: {
                        authenticationAccounts: true,
                    },
                },
                skillGroup: true,
            },
        });

        if (!sprocketPlayer) throw new Error("No sprocket player found");
        if (sprocketPlayer.skillGroup.id === skillGroupId) {
            const mlePlayer = await this.getMlePlayerBySprocketPlayer(sprocPlayerId);
            mlePlayer.salary = salary;
            await this.mle_playerRepository.save(mlePlayer);
            return mlePlayer;
        }

        const discId = sprocketPlayer.member.user.authenticationAccounts.find(aa => aa.accountType === UserAuthenticationAccountType.DISCORD);
        if (!discId) throw new Error("No discord Id");

        const sg = await this.skillGroupService.getGameSkillGroupById(skillGroupId);

        let player = await this.mle_playerRepository.findOneOrFail({
            where: {
                discordId: discId.accountId,
            },
        });

        if (sg.ordinal > sprocketPlayer.skillGroup.ordinal) {
            player = this.mle_playerRepository.merge(player, {
                role: Role.NONE,
                teamName: "Waivers",
                league: LeagueOrdinals[sg.ordinal - 1],
                salary: salary,
            });
        } else {
            player = this.mle_playerRepository.merge(player, {
                role: Role.NONE,
                league: LeagueOrdinals[sg.ordinal - 1],
                salary: salary,
            });
        }

        await this.mle_playerRepository.save(player);

        return player;
    }

    async mle_rankDownPlayer(sprocPlayerId: number, salary: number): Promise<MLE_Player> {
        this.logger.verbose(`mle_rankDownPlayer: sprocPlayerId=${sprocPlayerId}, salary=${salary}`);
        const sprocketPlayer = await this.getPlayer({
            where: { id: sprocPlayerId },
            relations: {
                member: {
                    profile: true,
                    user: {
                        authenticationAccounts: true,
                    },
                },
            },
        });
        const discId = sprocketPlayer.member.user.authenticationAccounts.find(aa => aa.accountType === UserAuthenticationAccountType.DISCORD);
        if (!discId) throw new Error("No discord Id");

        let player = await this.mle_playerRepository.findOneOrFail({
            where: {
                discordId: discId.accountId,
            },
        });
        const oldTeamName = player.teamName;

        player = this.mle_playerRepository.merge(player, {
            role: Role.NONE,
            teamName: "Waivers",
            league: this.mle_nextLeague(player.league, -1),
            salary: salary,
        });

        await this.mle_playerRepository.save(player);

        // Move player to Waiver Wire
        // TODO fix later when we abstract away from MLE
        await this.eventsService.publish(EventTopic.PlayerTeamChanged, {
            organizationId: sprocketPlayer.member.organizationId,
            discordId: discId.accountId,
            playerId: sprocketPlayer.id,
            name: sprocketPlayer.member.profile.name,
            old: {
                name: oldTeamName,
            },
            new: {
                name: "Waivers",
            },
        });

        return player;
    }

    async mle_rankUpPlayer(sprocPlayerId: number, salary: number): Promise<MLE_Player> {
        this.logger.verbose(`mle_rankUpPlayer: sprocPlayerId=${sprocPlayerId}, salary=${salary}`);
        const sproc = await this.getPlayer({
            where: { id: sprocPlayerId },
            relations: {
                member: {
                    user: {
                        authenticationAccounts: true,
                    },
                },
            },
        });
        const discId = sproc.member.user.authenticationAccounts.find(aa => aa.accountType === UserAuthenticationAccountType.DISCORD);
        if (!discId) throw new Error("No discord Id");

        let player = await this.mle_playerRepository.findOneOrFail({
            where: {
                discordId: discId.accountId,
            },
        });

        player = this.mle_playerRepository.merge(player, {
            role: Role.NONE,
            league: this.mle_nextLeague(player.league, 1),
            salary: salary,
        });

        await this.mle_playerRepository.save(player);
        return player;
    }

    // Have this because circular dependencies suck. Temp only for MLEDB integration so /shrug
    // Can refactor after extended repos is a thing
    async getMlePlayerBySprocketPlayer(playerId: number): Promise<MLE_Player> {
        const bridge = await this.ptpRepo.findOneOrFail({ where: { sprocketPlayerId: playerId } });
        return this.mle_playerRepository.findOneOrFail({ where: { id: bridge.mledPlayerId } });
    }

    async getPlayerByGameAndPlatform(gameId: number, platformId: number, platformAccountId: string, relations?: FindOptionsRelations<Player>): Promise<Player> {
        this.logger.verbose(`getPlayerByGameAndPlatform: gameId=${gameId}, platformId=${platformId}, platformAccountId=${platformAccountId}`);
        return this.playerRepository.findOneOrFail({
            where: {
                skillGroup: {
                    game: {
                        id: gameId,
                    },
                },
                member: {
                    platformAccounts: {
                        platform: {
                            id: platformId,
                        },
                        platformAccountId: platformAccountId,
                    },
                },
            },
            relations: Object.assign({
                skillGroup: {
                    game: true,
                },
                member: {
                    user: true,
                    platformAccounts: {
                        platform: true,
                    },
                },
            }, relations),
        });
    }

    async getPlayerByGameAndPlatformPayload(data: {
        platform: string;
        platformId: string;
        gameId: number;
    }): Promise<CoreOutput<CoreEndpoint.GetPlayerByPlatformId>> {
        this.logger.verbose(`getPlayerByGameAndPlatformPayload: ${JSON.stringify(data)}`);
        try {
            const platform = await this.platformService.getPlatformByCode(data.platform);
            const player = await this.getPlayerByGameAndPlatform(data.gameId, platform.id, data.platformId);
            const mlePlayer = await this.getMlePlayerBySprocketPlayer(player.id);

            return {
                success: true,
                data: {
                    id: player.id,
                    userId: player.member.user.id,
                    skillGroupId: player.skillGroupId,
                    franchise: {
                        name: mlePlayer.teamName,
                    },
                },
                request: data,
            };
        } catch (e) {
            this.logger.error(`getPlayerByGameAndPlatformPayload failed: ${e}`);
            return {
                success: false,
                request: data,
            };
        }
    }

    async intakeUser(
        name: string,
        d_id: string,
        ptl: CreatePlayerTuple[],
    ): Promise<string> {
        this.logger.verbose(`intakeUser: name=${name}, d_id=${d_id}, ptl=${JSON.stringify(ptl)}`);
        const mleOrg = await this.organizationRepository.findOneOrFail({ where: { profile: { name: "Minor League Esports" } }, relations: { profile: true } });

        const runner = this.dataSource.createQueryRunner();
        await runner.connect();
        await runner.startTransaction();

        try {
            let user = await runner.manager.findOne(User, {
                where: {
                    authenticationAccounts: {
                        accountId: d_id,
                        accountType: UserAuthenticationAccountType.DISCORD,
                    },
                },
                relations: {
                    authenticationAccounts: true,
                    profile: true,
                    members: {
                        organization: true,
                        profile: true,
                    },
                },
            });

            let member: Member;

            if (user) {
                const existingMember = user.members.find(m => m.organization.id === mleOrg.id);
                if (existingMember) {
                    member = existingMember;
                } else {
                    member = this.memberRepository.create({});
                    member.organization = mleOrg;
                    member.user = user;
                    member.profile = this.memberProfileRepository.create({
                        name: name,
                    });
                    member.profile.member = member;

                    await runner.manager.save(member);
                    await runner.manager.save(member.profile);
                }
            } else {
                user = this.userRepository.create({});

                user.profile = this.userProfileRepository.create({
                    user: user,
                    email: "unknown@sprocket.gg",
                    displayName: name,
                });
                user.profile.user = user;

                const authAcc = this.userAuthRepository.create({
                    accountType: UserAuthenticationAccountType.DISCORD,
                    accountId: d_id,
                });
                authAcc.user = user;
                user.authenticationAccounts = [authAcc];

                member = this.memberRepository.create({});
                member.organization = mleOrg;
                member.user = user;
                member.profile = this.memberProfileRepository.create({
                    name: name,
                });
                member.profile.member = member;

                await runner.manager.save(user);
                await runner.manager.save(user.profile);
                await runner.manager.save(user.authenticationAccounts);
                await runner.manager.save(member);
                await runner.manager.save(member.profile);
            }

            // For each game this user is going to participate in, create
            // the corresponding player
            for (const pt of ptl) {
                const existingPlayer = await runner.manager.findOne(Player, {
                    where: {
                        member: { id: member.id },
                        skillGroup: { id: pt.gameSkillGroupId },
                    },
                });

                if (existingPlayer) {
                    this.logger.warn(`Player already exists for member ${member.id} and skillGroup ${pt.gameSkillGroupId}. Skipping creation.`);
                    continue;
                }

                const player = await this.createPlayer(member, pt.gameSkillGroupId, pt.salary, runner);
                const skillGroup = await this.skillGroupService.getGameSkillGroupById(pt.gameSkillGroupId);

                await this.eloConnectorService.createJob(EloEndpoint.AddPlayerBySalary, {
                    id: player.id,
                    name: name,
                    salary: pt.salary,
                    skillGroup: skillGroup.ordinal,
                });
            }

            await runner.commitTransaction();
            // Send the newly created user back to the caller
            return user.id as string;
        } catch (e) {
            this.logger.error(e);
            await runner.rollbackTransaction();
            return e as string;
        }
    }

    async swapDiscordAccounts(newAcct: string, oldAcct: string): Promise<void> {
        this.logger.verbose(`swapDiscordAccounts: newAcct=${newAcct}, oldAcct=${oldAcct}`);
        // First, do the MLEDB Player table
        const mlePlayer = await this.mle_playerRepository.findOneOrFail({ where: { discordId: oldAcct } });
        mlePlayer.discordId = newAcct;
        await this.mle_playerRepository.save(mlePlayer);

        // Then, follow up with Sprocket.
        const uaa = await this.userAuthRepository.findOneOrFail(
            {
                where: {
                    accountId: oldAcct,
                    accountType: UserAuthenticationAccountType.DISCORD
                }
            }
        );
        uaa.accountId = newAcct;
        await this.userAuthRepository.save(uaa);

    }

    async forcePlayerToTeam(mleid: number, newTeam: string): Promise<void> {
        this.logger.verbose(`forcePlayerToTeam: mleid=${mleid}, newTeam=${newTeam}`);
        const mlePlayer = await this.mle_playerRepository.findOneOrFail({ where: { mleid } });
        mlePlayer.teamName = newTeam;
        await this.mle_playerRepository.save(mlePlayer);
    }

    async changePlayerName(mleid: number, newName: string): Promise<void> {
        this.logger.verbose(`changePlayerName: mleid=${mleid}, newName=${newName}`);
        const mlePlayer = await this.mle_playerRepository.findOneOrFail({ where: { mleid } });
        mlePlayer.name = newName;
        await this.mle_playerRepository.save(mlePlayer);

        const uaa = await this.userAuthRepository.findOneOrFail(
            {
                where: {
                    accountId: mlePlayer.discordId ?? "",
                    accountType: UserAuthenticationAccountType.DISCORD,
                },
                relations: {
                    user: {
                        id: true,
                        profile: {
                            id: true,
                            displayName: true,
                        },
                    },
                },
            });
        const up = uaa.user.profile;
        up.displayName = newName;
        await this.userProfileRepository.save(up);
    }
}
