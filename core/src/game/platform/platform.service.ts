import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import {Platform} from "../../database";

@Injectable()
export class PlatformService {
    constructor(
        @InjectRepository(Platform)
        private platformRepository: Repository<Platform>,
    ) {}

    async getPlatformById(id: number): Promise<Platform> {
        return this.platformRepository.findOneOrFail({where: {id}});
    }

    async getPlatformByCode(code: string): Promise<Platform> {
        return this.platformRepository.findOneOrFail({where: {code}});
    }

    async getPlatforms(): Promise<Platform[]> {
        return this.platformRepository.find();
    }

    async createPlatform(code: string): Promise<Platform> {
        const platform = this.platformRepository.create({code});
        await this.platformRepository.save(platform);

        return platform;
    }
}
