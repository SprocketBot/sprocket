import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import {CoreEndpoint, CoreSchemas} from "@sprocketbot/common";

import type {SprocketConfiguration} from "./database/sprocket-configuration.entity";
import {SprocketConfigurationRepository} from "./database/sprocket-configuration.repository";

@Controller("sprocket-configuration")
export class SprocketConfigurationController {
    constructor(private readonly sprocketConfigurationRepository: SprocketConfigurationRepository) {}

    @MessagePattern(CoreEndpoint.GetSprocketConfiguration)
    async getSprocketConfiguration(@Payload() payload: unknown): Promise<SprocketConfiguration[]> {
        const data = CoreSchemas.GetSprocketConfiguration.input.parse(payload);

        return this.sprocketConfigurationRepository.find({where: {key: data.key}});
    }
}
