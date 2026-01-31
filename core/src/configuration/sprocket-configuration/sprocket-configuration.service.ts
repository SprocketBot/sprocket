import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import {SprocketConfiguration} from "$db/configuration/sprocket_configuration/sprocket_configuration.model";

@Injectable()
export class SprocketConfigurationService {
    constructor(@InjectRepository(SprocketConfiguration)
    private sprocketConfigurationRepository: Repository<SprocketConfiguration>) {}

    async getSprocketConfiguration(key?: string): Promise<SprocketConfiguration[]> {
        if (key) return this.sprocketConfigurationRepository.find({where: {key} });
        return this.sprocketConfigurationRepository.find();
    }
}
