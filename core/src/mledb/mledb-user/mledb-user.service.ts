import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {MLE_Player} from "src/database/mledb/Player.model";
import {MLE_PlayerToOrg} from "src/database/mledb/PlayerToOrg.model";
import {Repository} from "typeorm";
@Injectable()
export class MledbUserService {
    constructor(
        @InjectRepository(MLE_Player) private playerRepository: Repository<MLE_Player>,
        @InjectRepository(MLE_PlayerToOrg) private playerToOrgRepository: Repository<MLE_PlayerToOrg>,
    ) {}

    async getUserByDiscordId(id: string): Promise<MLE_Player> {
        const players = await this.playerRepository.find({where: {discordId: id} });
        return players[0];
    }

    async getUserOrgs(player: MLE_Player): Promise<MLE_PlayerToOrg[]> {
        const playerToOrgs = await this.playerToOrgRepository.find({relations: ["player"], where: {player: player} });
        return playerToOrgs;
    }
}
