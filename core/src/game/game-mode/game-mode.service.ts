import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {
    FindManyOptions, FindOneOptions, FindOptionsWhere,
} from "typeorm";
import {Repository} from "typeorm";

import type { GameMode } from "../../database/game/game_mode/game_mode.model";

@Injectable()
export class GameModeService {
    constructor(@InjectRepository(GameMode) private gameModeRepository: Repository<GameMode>) {}

    async getGameModeById(id: number, options?: FindOneOptions<GameMode>): Promise<GameMode> {
        return this.gameModeRepository.findOneOrFail({...options, where: {...options?.where, id} as FindOptionsWhere<GameMode>});
    }

    async getGameModes(query: FindManyOptions<GameMode>): Promise<GameMode[]> {
        return this.gameModeRepository.find(query);
    }
}
