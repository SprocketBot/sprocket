import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {FindManyOptions, FindOneOptions} from "typeorm";
import {Repository} from "typeorm";

import type { Game } from "../../database/game/game/game.model";

@Injectable()
export class GameService {
    constructor(@InjectRepository(Game) private gameRepository: Repository<Game>) {}

    async getGameByTitle(title: string): Promise<Game> {
        return this.gameRepository.findOneOrFail({
            where: {
                title,
            },
        });
    }

    async getGameById(id: number): Promise<Game> {
        return this.gameRepository.findOneOrFail({where: {id} });
    }

    async getGames(query?: FindManyOptions<Game>): Promise<Game[]> {
        return this.gameRepository.find(query);
    }

    async getGame(query: FindOneOptions<Game>): Promise<Game> {
        return this.gameRepository.findOneOrFail(query);
    }
}
