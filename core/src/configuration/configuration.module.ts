import {forwardRef, Module} from "@nestjs/common";

import {DatabaseModule} from "../database";
import {OrganizationModule} from "../organization";
import {
    OrganizationConfigurationResolver,
    OrganizationConfigurationService,
} from "./organization-configuration";
import {OrganizationConfigurationController} from "./organization-configuration/organization-configuration.controller";
import {
    SprocketConfigurationResolver,
    SprocketConfigurationService,
} from "./sprocket-configuration";
import {SprocketConfigurationController} from "./sprocket-configuration/sprocket-configuration.controller";

@Module({
    imports: [DatabaseModule, forwardRef(() => OrganizationModule)],
    providers: [
        OrganizationConfigurationResolver,
        OrganizationConfigurationService,
        SprocketConfigurationResolver,
        SprocketConfigurationService,
    ],
    exports: [OrganizationConfigurationService],
    controllers: [OrganizationConfigurationController, SprocketConfigurationController],
})
export class ConfigurationModule {}
