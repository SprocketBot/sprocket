import {Module} from "@nestjs/common";

import {OrganizationDatabaseModule} from "../organization/database/organization-database.module";
import {ConfigurationDatabaseModule} from "./database/configuration-database.module";
import {OrganizationConfigurationController} from "./organization-configuration/organization-configuration.controller";
import {OrganizationConfigurationService} from "./organization-configuration/organization-configuration.service";
import {SprocketConfigurationController} from "./sprocket-configuration/sprocket-configuration.controller";

@Module({
    imports: [ConfigurationDatabaseModule, OrganizationDatabaseModule],
    controllers: [OrganizationConfigurationController, SprocketConfigurationController],
    providers: [OrganizationConfigurationService],
    exports: [OrganizationConfigurationService],
})
export class ConfigurationModule {}
