import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {FindManyOptions, FindOneOptions} from "typeorm";
import {Repository} from "typeorm";

import {GameMode} from "../../database";

@Injectable()
export class GameModeService {
    constructor(@InjectRepository(GameMode) private gameModeRepository: Repository<GameMode>) {}

    async getGameModeById(id: number, options?: FindOneOptions<GameMode>): Promise<GameMode> {
        return this.gameModeRepository.findOneOrFail(id, options);
    }

    async getGameModes(query: FindManyOptions<GameMode>): Promise<GameMode[]> {
        return this.gameModeRepository.find(query);
    }
}
