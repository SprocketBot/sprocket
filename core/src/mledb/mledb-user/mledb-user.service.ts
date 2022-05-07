import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {MLE_Player} from "src/database/mledb/Player.model";
import {Repository} from "typeorm";
@Injectable()
export class MledbUserService {
    constructor(@InjectRepository(MLE_Player) private playerRepository: Repository<MLE_Player>) {}

    async getUserByDiscordId(id: string): Promise<MLE_Player> {
        const players = await this.playerRepository.find({where: {discordId: id} });
        return players[0];
    }
}
