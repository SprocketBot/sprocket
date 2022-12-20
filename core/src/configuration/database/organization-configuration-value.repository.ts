import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {OrganizationConfigurationValue} from "./organization-configuration-value.entity";

@Injectable()
export class OrganizationConfigurationValueRepository extends ExtendedRepository<OrganizationConfigurationValue> {
    constructor(readonly dataSource: DataSource) {
        super(OrganizationConfigurationValue, dataSource);
    }
}
