import {
    forwardRef, Inject, Injectable, Logger,
} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {config} from "@sprocketbot/common";
import {Repository} from "typeorm";

import type {Player} from "$db/franchise/player/player.model";
import type {User} from "$db/identity/user/user.model";
import {UserAuthenticationAccountType} from "$db/identity/user_authentication_account/user_authentication_account_type.enum";
import {MemberPlatformAccount} from "$db/organization/member_platform_account/member_platform_account.model";

import type {MLE_Platform} from "../../database/mledb";
import {
    MLE_Player,
    MLE_PlayerAccount,
    MLE_PlayerToOrg,
    MLE_Team,
    MLE_TeamToCaptain,
} from "../../database/mledb";
import {GameService, PlatformService} from "../../game";
import {UserService} from "../../identity";
import {MemberPlatformAccountService} from "../../organization/member-platform-account";

@Injectable()
export class MledbPlayerService {
    private readonly logger = new Logger(MledbPlayerService.name);

    constructor(
    @InjectRepository(MLE_Player) private readonly playerRepository: Repository<MLE_Player>,
    @InjectRepository(MLE_PlayerAccount)
    private readonly playerAccountRepository: Repository<MLE_PlayerAccount>,
    @InjectRepository(MLE_PlayerToOrg)
    private readonly playerToOrgRepository: Repository<MLE_PlayerToOrg>,
    @InjectRepository(MLE_Team) private readonly teamRepo: Repository<MLE_Team>,
    @InjectRepository(MLE_TeamToCaptain)
    private readonly teamToCaptainRepo: Repository<MLE_TeamToCaptain>,
    @InjectRepository(MemberPlatformAccount)
    private readonly memberPlatformAccountRepository: Repository<MemberPlatformAccount>,
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
    @Inject(forwardRef(() => GameService)) private readonly gameService: GameService,
    @Inject(forwardRef(() => PlatformService)) private readonly platformService: PlatformService,
    @Inject(forwardRef(() => MemberPlatformAccountService))
    private readonly memberPlatformAccountService: MemberPlatformAccountService,
    ) {}

    /**
     * Resolve the Sprocket user id for a platform account. Prefer sprocket.member_platform_account
     * (source of truth); fall back to mledb.player_account + Discord crosswalk during cutover.
     */
    private async resolveSprocketUserIdForPlatformAccount(
        platform: MLE_Platform,
        platformId: string,
    ): Promise<number> {
        const mpa = await this.memberPlatformAccountRepository.findOne({
            where: {
                platformAccountId: platformId,
                platform: {code: platform},
            },
            relations: {
                member: {user: true},
                platform: true,
            },
        });
        if (mpa?.member?.user?.id) {
            return mpa.member.user.id;
        }

        const playerAccount = await this.playerAccountRepository.findOne({
            where: {platform, platformId},
            relations: {player: true},
        });
        if (!playerAccount?.player?.discordId) {
            throw new Error(`No Sprocket or legacy MLEDB link for platform account (${platform} | ${platformId})`);
        }

        const user = await this.userService.getUser({
            where: {
                user: {
                    authenticationAccounts: {
                        accountId: playerAccount.player.discordId,
                        accountType: UserAuthenticationAccountType.DISCORD,
                    },
                },
            },
            relations: {user: true},
        });
        if (!user) {
            throw new Error(`No sprocket user found (${platform} | ${platformId})`);
        }

        const mleMember = await this.userService.getUserById(user.id, {
            relations: {members: {organization: true} },
        });
        const defaultOrgMember = mleMember.members?.find(
            m => m.organizationId === config.defaultOrganizationId,
        );
        if (defaultOrgMember) {
            try {
                const plat = await this.platformService.getPlatformByCode(platform);
                await this.memberPlatformAccountService.upsertMemberPlatformAccount(
                    defaultOrgMember,
                    plat.id,
                    platformId,
                );
            } catch (e) {
                this.logger.warn(
                    `Backfill member_platform_account failed (${platform}|${platformId}): ${
                        e instanceof Error ? e.message : String(e)
                    }`,
                );
            }
        }

        return user.id;
    }

    async getPlayerByDiscordId(id: string): Promise<MLE_Player> {
        const players = await this.playerRepository.find({where: {discordId: id} });
        return players[0];
    }

    async getPlayerOrgs(player: MLE_Player): Promise<MLE_PlayerToOrg[]> {
        const playerToOrgs = await this.playerToOrgRepository.find({
            relations: {player: true},
            where: {player: {id: player.id} },
        });
        return playerToOrgs;
    }

    async getPlayerByPlatformId(platform: MLE_Platform, platformId: string): Promise<MLE_Player> {
        try {
            const userId = await this.resolveSprocketUserIdForPlatformAccount(platform, platformId);
            return await this.getMlePlayerBySprocketUser(userId);
        } catch {
            const playerAccount = await this.playerAccountRepository.findOne({
                where: {platform, platformId},
                relations: {player: true},
            });
            if (!playerAccount?.player) {
                throw new Error(`No player found for platform account (${platform} | ${platformId})`);
            }
            return playerAccount.player;
        }
    }

    async getMlePlayerBySprocketUser(userId: number): Promise<MLE_Player> {
        const sprocketUser = await this.userService.getUserById(userId, {
            relations: {authenticationAccounts: true},
        });

        const account = sprocketUser?.authenticationAccounts.find(aa => aa.accountType === UserAuthenticationAccountType.DISCORD);
        if (!account) {
            throw new Error("Discord Authentication Account not found");
        }
        return this.playerRepository.findOneOrFail({
            where: {
                discordId: account.accountId,
            },
        });
    }

    async getPlayerFranchise(id: number): Promise<MLE_Team> {
        const player = await this.playerRepository.findOneOrFail({where: {id} });
        return this.teamRepo.findOneOrFail({
            where: {
                name: player.teamName,
            },
        });
    }

    async playerIsCaptain(id: number): Promise<boolean> {
        const player = await this.playerRepository.findOneOrFail({where: {id} });
        const ttc = await this.teamToCaptainRepo.find({
            where: {
                teamName: player.teamName,
                playerId: player.id,
            },
        });
        return ttc.length > 0;
    }

    /**
     * Get all teams where the player holds a staff position (FM, GM, AGM)
     * Used for non-playing staff members (team FP/FA) to determine franchise access
     */
    async getTeamsWherePlayerIsStaff(playerId: number): Promise<MLE_Team[]> {
        const teams = await this.teamRepo.find({
            where: [
                {franchiseManagerId: playerId},
                {generalManagerId: playerId},
                {doublesAssistantGeneralManagerId: playerId},
                {standardAssistantGeneralManagerId: playerId},
            ],
        });
        return teams;
    }

    async getSprocketUserByPlatformInformation(
        platform: MLE_Platform,
        platformId: string,
    ): Promise<User> {
        const userId = await this.resolveSprocketUserIdForPlatformAccount(platform, platformId);
        return this.userService.getUserById(userId, {
            relations: {
                authenticationAccounts: true,
                members: {
                    players: {
                        skillGroup: {
                            game: true,
                        },
                    },
                },
            },
        });
    }

    async getSprocketPlayerByPlatformInformation(
        platform: MLE_Platform,
        platformId: string,
    ): Promise<Player> {
        const userId = await this.resolveSprocketUserIdForPlatformAccount(platform, platformId);
        const user = await this.userService.getUserById(userId, {
            relations: {
                authenticationAccounts: true,
                members: {
                    players: {
                        skillGroup: {
                            game: true,
                        },
                    },
                },
            },
        });

        const member = user.members.find(m => m.organizationId === config.defaultOrganizationId);
        if (!member) {
            throw new Error(`Member not found in MLE for user ${user.id}`);
        }

        const rocketLeague = await this.gameService.getGameByTitle("Rocket League");

        const player = member.players.find(p => p.skillGroup.game.id === rocketLeague.id);

        if (!player) {
            throw new Error(`Player not found in MLE rocket league { user: ${user.id}, member: ${member.id} }`);
        }

        return player;
    }
}
