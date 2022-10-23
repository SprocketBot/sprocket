import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {OrganizationConfigurationValue} from "./organization_configuration_value.model";

@Injectable()
export class OrganizationConfigurationValueRepository extends ExtendedRepository<OrganizationConfigurationValue> {
    constructor(readonly dataSource: DataSource) {
        super(OrganizationConfigurationValue, dataSource);
    }
}
