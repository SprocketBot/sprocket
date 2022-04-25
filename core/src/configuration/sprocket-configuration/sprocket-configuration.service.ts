import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import {SprocketConfiguration} from "../../database";

@Injectable()
export class SprocketConfigurationService {
    constructor(@InjectRepository(SprocketConfiguration) private sprocketConfigurationRepository: Repository<SprocketConfiguration>) {}

    async getSprocketConfiguration(key?: string): Promise<SprocketConfiguration[]> {
        if (key) return this.sprocketConfigurationRepository.find({key});
        return this.sprocketConfigurationRepository.find();
    }
}
