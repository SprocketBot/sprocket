import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {OrganizationConfigurationAllowedValue} from "./organization-configuration-allowed-value.entity";
import {OrganizationConfigurationAllowedValueRepository} from "./organization-configuration-allowed-value.repository";
import {OrganizationConfigurationKey} from "./organization-configuration-key.entity";
import {OrganizationConfigurationKeyRepository} from "./organization-configuration-key.repository";
import {OrganizationConfigurationValue} from "./organization-configuration-value.entity";
import {OrganizationConfigurationValueRepository} from "./organization-configuration-value.repository";
import {SprocketConfiguration} from "./sprocket-configuration.entity";
import {SprocketConfigurationRepository} from "./sprocket-configuration.repository";
import {Verbiage} from "./verbiage.entity";
import {VerbiageRepository} from "./verbiage.repository";
import {VerbiageCode} from "./verbiage-code.entity";
import {VerbiageCodeRepository} from "./verbiage-code.repository";

const ormModule = TypeOrmModule.forFeature([
    OrganizationConfigurationAllowedValue,
    OrganizationConfigurationKey,
    OrganizationConfigurationValue,
    SprocketConfiguration,
    Verbiage,
    VerbiageCode,
]);

const providers = [
    OrganizationConfigurationAllowedValueRepository,
    OrganizationConfigurationKeyRepository,
    OrganizationConfigurationValueRepository,
    SprocketConfigurationRepository,
    VerbiageRepository,
    VerbiageCodeRepository,
];

@Module({
    imports: [ormModule],
    providers: providers,
    exports: providers,
})
export class ConfigurationDatabaseModule {}
