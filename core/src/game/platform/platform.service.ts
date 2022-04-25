import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import {Platform} from "../../database";

@Injectable()
export class PlatformService {
    constructor(@InjectRepository(Platform) private platformRepository: Repository<Platform>) {}

    async getPlatformById(id: number): Promise<Platform> {
        return this.platformRepository.findOneOrFail(id);
    }

    async getPlatforms(): Promise<Platform[]> {
        return this.platformRepository.find();
    }
}
