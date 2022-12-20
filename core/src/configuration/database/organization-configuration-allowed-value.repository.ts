import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {OrganizationConfigurationAllowedValue} from "./organization-configuration-allowed-value.entity";

@Injectable()
export class OrganizationConfigurationAllowedValueRepository extends ExtendedRepository<OrganizationConfigurationAllowedValue> {
    constructor(readonly dataSource: DataSource) {
        super(OrganizationConfigurationAllowedValue, dataSource);
    }
}
