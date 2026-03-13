import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {EntityManager, Repository} from "typeorm";

import {Platform} from "../../database/game/platform/platform.model";

@Injectable()
export class PlatformService {
    constructor(@InjectRepository(Platform) private platformRepository: Repository<Platform>) {}

    async getPlatformById(id: number, manager?: EntityManager): Promise<Platform> {
        const repo = manager ? manager.getRepository(Platform) : this.platformRepository;
        return repo.findOneOrFail({where: {id} });
    }

    async getPlatformByCode(code: string, manager?: EntityManager): Promise<Platform> {
        const repo = manager ? manager.getRepository(Platform) : this.platformRepository;
        return repo.findOneOrFail({where: {code} });
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
