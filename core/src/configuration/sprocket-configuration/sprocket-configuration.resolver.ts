import {
    Args, Query, Resolver,
} from "@nestjs/graphql";

import {SprocketConfiguration} from '../../database';;;
import {SprocketConfigurationService} from "./sprocket-configuration.service";

@Resolver(() => SprocketConfiguration)
export class SprocketConfigurationResolver {
    constructor(private readonly service: SprocketConfigurationService) {}

    @Query(() => [SprocketConfiguration])
    async getSprocketConfiguration(@Args("key", {nullable: true}) key?: string): Promise<SprocketConfiguration[]> {
        return this.service.getSprocketConfiguration(key);
    }
}
