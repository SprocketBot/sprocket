import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import type {FindManyOptions} from "typeorm/find-options/FindManyOptions";

import {IrrelevantFields, Player} from "../../database";
@Injectable()
export class MledbUserService {
    constructor(
        @InjectRepository(Player) private playerRepository: Repository<Player>,
    ) {}

    async getUserByDiscordId(discordId: string): Promise<Player> {
        return this.playerRepository.find({where: {discordId: discordId}})[0];
    }
}
