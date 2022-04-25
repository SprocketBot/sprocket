import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import type {FindManyOptions} from "typeorm/find-options/FindManyOptions";

import {GameMode} from "../../database";

@Injectable()
export class GameModeService {
    constructor(@InjectRepository(GameMode) private gameModeRepository: Repository<GameMode>) {}

    async getGameModeById(id: number): Promise<GameMode> {
        return this.gameModeRepository.findOneOrFail(id);
    }

    async getGameModes(query: FindManyOptions<GameMode>): Promise<GameMode[]> {
        return this.gameModeRepository.find(query);
    }
}
