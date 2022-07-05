import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import type {MLE_Platform} from "../../database/mledb";
import {
    MLE_Player, MLE_PlayerAccount, MLE_PlayerToOrg,
} from "../../database/mledb";

@Injectable()
export class MledbPlayerService {
    constructor(
        @InjectRepository(MLE_Player) private playerRepository: Repository<MLE_Player>,
        @InjectRepository(MLE_PlayerAccount) private playerAccountRepository: Repository<MLE_PlayerAccount>,
        @InjectRepository(MLE_PlayerToOrg) private playerToOrgRepository: Repository<MLE_PlayerToOrg>,
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
}
