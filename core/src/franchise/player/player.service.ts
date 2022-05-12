import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {FindOneOptions} from "typeorm";
import {Repository} from "typeorm";

import {Player} from "../../database";

@Injectable()
export class PlayerService {
    constructor(@InjectRepository(Player) private playerRepository: Repository<Player>) {}

    async getPlayer(query: FindOneOptions<Player>): Promise<Player> {
        return this.playerRepository.findOneOrFail(query);
    }

    async getPlayerById(id: number): Promise<Player> {
        return this.playerRepository.findOneOrFail(id);
    }
}
