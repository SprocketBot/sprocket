import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {OrganizationConfigurationAllowedValue} from "./organization_configuration_allowed_value";
import {OrganizationConfigurationKey} from "./organization_configuration_key";
import {OrganizationConfigurationValue} from "./organization_configuration_value";
import {SprocketConfiguration} from "./sprocket_configuration";
import {Verbiage} from "./verbiage";
import {VerbiageCode} from "./verbiage_code";

export const configurationEntities = [
    OrganizationConfigurationAllowedValue,
    OrganizationConfigurationKey,
    OrganizationConfigurationValue,
    SprocketConfiguration,
    Verbiage,
    VerbiageCode,
];

const ormModule = TypeOrmModule.forFeature(configurationEntities);


@Module({
    imports: [
        ormModule,
    ],
    exports: [
        ormModule,
    ],

})
export class ConfigurationModule {
}
