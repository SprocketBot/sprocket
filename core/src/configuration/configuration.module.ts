import {Module} from "@nestjs/common";

import {ConfigurationDatabaseModule} from "./database/configuration-database.module";
import {OrganizationConfigurationService} from "./organization-configuration.service";
import {SprocketConfigurationController} from "./sprocket-configuration.controller";

@Module({
    imports: [ConfigurationDatabaseModule],
    controllers: [SprocketConfigurationController],
    providers: [OrganizationConfigurationService],
})
export class ConfigurationModule {}
