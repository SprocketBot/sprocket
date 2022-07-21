import {
    forwardRef, Inject, Injectable, Logger,
} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import {UserAuthenticationAccountType} from "../../database";
import type {MLE_Platform} from "../../database/mledb";
import {
    MLE_Player, MLE_PlayerAccount, MLE_PlayerToOrg,
    MLE_Team, MLE_TeamToCaptain,
} from "../../database/mledb";
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
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
    ) {}

    async getPlayerByDiscordId(id: string): Promise<MLE_Player> {
        const players = await this.playerRepository.find({where: {discordId: id} });
        return players[0];
    }

    async getPlayerOrgs(player: MLE_Player): Promise<MLE_PlayerToOrg[]> {
        const playerToOrgs = await this.playerToOrgRepository.find({relations: ["player"], where: {player: player} });
        return playerToOrgs;
    }

    async getPlayerByPlatformId(platform: MLE_Platform, platformId: string): Promise<MLE_Player> {
        const playerAccount = await this.playerAccountRepository.findOneOrFail({platform, platformId}, {relations: ["player"] });
        return playerAccount.player;
    }

    async getMlePlayerBySprocketUser(userId: number): Promise<MLE_Player> {
        const sprocketUser = await this.userService.getUserById(userId, {relations: ["authenticationAccounts"] });

        this.logger.debug(JSON.stringify(sprocketUser, null, 2));

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
        const player = await this.playerRepository.findOneOrFail(id);
        return this.teamRepo.findOneOrFail({
            where: {
                name: player.teamName,
            },
        });
    }

    async playerIsCaptain(id: number): Promise<boolean> {
        const player = await this.playerRepository.findOneOrFail(id);
        const ttc = await this.teamToCaptainRepo.find({
            where: {
                teamName: player.teamName,
                playerId: player.id,
            },
        });
        return ttc.length > 0;
    }
}
