import {Injectable} from "@nestjs/common";

import type {SprocketConfiguration} from "$models";
import {SprocketConfigurationRepository} from "$repositories";

@Injectable()
export class SprocketConfigurationService {
    constructor(private sprocketConfigurationRepository: SprocketConfigurationRepository) {}

    async getSprocketConfiguration(key?: string): Promise<SprocketConfiguration[]> {
        if (key) return this.sprocketConfigurationRepository.find({where: {key}});
        return this.sprocketConfigurationRepository.find();
    }
}
