import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {OrganizationConfigurationAllowedValue} from "./organization_configuration_allowed_value.model";

@Injectable()
export class OrganizationConfigurationAllowedValueRepository extends ExtendedRepository<OrganizationConfigurationAllowedValue> {
    constructor(readonly dataSource: DataSource) {
        super(OrganizationConfigurationAllowedValue, dataSource);
    }
}
