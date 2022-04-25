import {Module} from "@nestjs/common";

import {DatabaseModule} from "../database";
import {OrganizationModule} from "../organization/organization.module";
import {OrganizationConfigurationResolver} from "./organization-configuration/organization-confguration.resolvers";
import {OrganizationConfigurationService} from "./organization-configuration/organization-configuration.service";
import {SprocketConfigurationResolver} from "./sprocket-configuration/sprocket-configuration.resolver";
import {SprocketConfigurationService} from "./sprocket-configuration/sprocket-configuration.service";

@Module({
    imports: [DatabaseModule, OrganizationModule],
    controllers: [],
    providers: [
        OrganizationConfigurationResolver,
        OrganizationConfigurationService,
        SprocketConfigurationResolver,
        SprocketConfigurationService,
    ],
})
export class ConfigurationModule {}
