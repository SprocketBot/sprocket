import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {FindManyOptions} from "typeorm";
import {Repository} from "typeorm";

import {Game} from "../../database";

@Injectable()
export class GameService {
    constructor(
        @InjectRepository(Game) private gameRepository: Repository<Game>,
    ) {}

    async getGameByTitle(title: string): Promise<Game> {
        return this.gameRepository.findOneOrFail({
            where: {
                title,
            },
        });
    }

    async getGameById(id: number): Promise<Game> {
        return this.gameRepository.findOneOrFail({where: {id}});
    }

    async getGames(query?: FindManyOptions<Game>): Promise<Game[]> {
        return this.gameRepository.find(query);
    }
}
