import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import {CoreEndpoint, CoreSchemas} from "@sprocketbot/common";

import type {SprocketConfiguration} from "$models";

import {SprocketConfigurationService} from "./sprocket-configuration.service";

@Controller("sprocket-configuration")
export class SprocketConfigurationController {
    constructor(private readonly sprocketConfigService: SprocketConfigurationService) {}

    @MessagePattern(CoreEndpoint.GetSprocketConfiguration)
    async getSprocketConfiguration(@Payload() payload: unknown): Promise<SprocketConfiguration[]> {
        const data = CoreSchemas.GetSprocketConfiguration.input.parse(payload);

        return this.sprocketConfigService.getSprocketConfiguration(data.key);
    }
}
