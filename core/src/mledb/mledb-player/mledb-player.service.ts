import {
    forwardRef, Inject, Injectable, Logger,
} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {config} from "@sprocketbot/common";
import {Repository} from "typeorm";

import type {Player} from "$db/franchise/player/player.model";
import type {User} from "$db/identity/user/user.model";
import {UserAuthenticationAccountType} from "$db/identity/user_authentication_account/user_authentication_account_type.enum";

import type {MLE_Platform} from "../../database/mledb";
import {
    MLE_Player, MLE_PlayerAccount, MLE_PlayerToOrg,
    MLE_Team, MLE_TeamToCaptain,
} from "../../database/mledb";
import {GameService} from "../../game";
import {UserService} from "../../identity";

@Injectable()
export class MledbPlayerService {
    private readonly logger = new Logger(MledbPlayerService.name);

    constructor(
        @InjectRepository(MLE_Player) private readonly playerRepository: Repository<MLE_Player>,
        @InjectRepository(MLE_PlayerAccount) private readonly playerAccountRepository: Repository<MLE_PlayerAccount>,
        @InjectRepository(MLE_PlayerToOrg) private readonly playerToOrgRepository: Repository<MLE_PlayerToOrg>,
        @InjectRepository(MLE_Team) private readonly teamRepo: Repository<MLE_Team>,
        @InjectRepository(MLE_TeamToCaptain) private readonly teamToCaptainRepo: Repository<MLE_TeamToCaptain>,
        @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
        @Inject(forwardRef(() => GameService)) private readonly gameService: GameService,
    ) {}

    async getPlayerByDiscordId(id: string): Promise<MLE_Player> {
        const players = await this.playerRepository.find({where: {discordId: id} });
        return players[0];
    }

    async getPlayerOrgs(player: MLE_Player): Promise<MLE_PlayerToOrg[]> {
        const playerToOrgs = await this.playerToOrgRepository.find({relations: {player: true}, where: {player: {id: player.id} } });
        return playerToOrgs;
    }

    async getPlayerByPlatformId(platform: MLE_Platform, platformId: string): Promise<MLE_Player> {
        const playerAccount = await this.playerAccountRepository.findOneOrFail({where: {platform, platformId}, relations: {player: true} });
        return playerAccount.player;
    }

    async getMlePlayerBySprocketUser(userId: number): Promise<MLE_Player> {
        const sprocketUser = await this.userService.getUserById(userId, {relations: {authenticationAccounts: true} });

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

    async getSprocketUserByPlatformInformation(platform: MLE_Platform, platformId: string): Promise<User> {
        const playerAccount = await this.playerAccountRepository.findOneOrFail({where: {platform, platformId}, relations: {player: true} });
        const {discordId} = playerAccount.player;

        if (!discordId) {
            throw new Error(`No discord account found for player ${playerAccount.player.name}`);
        }

        const user = await this.userService.getUser({
            where: {
                user: {
                    authenticationAccounts: {
                        accountId: discordId,
                        accountType: UserAuthenticationAccountType.DISCORD,
                    },
                },
            },
            relations: {
                user: {
                    authenticationAccounts: true,
                    members: {
                        players: {
                            skillGroup: {
                                game: true,
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            throw new Error(`No sprocket user found (${platform} | ${platformId})`);
        }

        return user;

    }

    async getSprocketPlayerByPlatformInformation(platform: MLE_Platform, platformId: string): Promise<Player> {
        const playerAccount = await this.playerAccountRepository.findOneOrFail({where: {platform, platformId}, relations: {player: true} });
        const {discordId} = playerAccount.player;

        if (!discordId) {
            throw new Error(`No discord account found for player ${playerAccount.player.name}`);
        }

        const user = await this.userService.getUser({
            where: {
                user: {
                    authenticationAccounts: {
                        accountId: discordId,
                        accountType: UserAuthenticationAccountType.DISCORD,
                    },
                },
            },
            relations: {
                user: {
                    authenticationAccounts: true,
                    members: {
                        players: {
                            skillGroup: {
                                game: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            throw new Error(`No sprocket user found (${platform} | ${platformId})`);
        }

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
