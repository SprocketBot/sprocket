import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {FindManyOptions, FindOneOptions} from "typeorm";
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

    async getPlayerByOrganizationAndGame(userId: number, organizationId: number, gameId: number): Promise<Player> {
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

    async getPlayers(query?: FindManyOptions<Player>): Promise<Player[]> {
        return this.playerRepository.find(query);
    }
}
