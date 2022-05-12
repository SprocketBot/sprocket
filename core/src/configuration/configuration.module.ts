import {Module} from "@nestjs/common";

import {DatabaseModule} from "../database";
import {OrganizationModule} from "../organization";
import {OrganizationConfigurationResolver, OrganizationConfigurationService} from "./organization-configuration";
import {SprocketConfigurationResolver, SprocketConfigurationService} from "./sprocket-configuration";

@Module({
    imports: [DatabaseModule, OrganizationModule],
    providers: [
        OrganizationConfigurationResolver,
        OrganizationConfigurationService,
        SprocketConfigurationResolver,
        SprocketConfigurationService,
    ],
    exports: [OrganizationConfigurationService],
})
export class ConfigurationModule {}
