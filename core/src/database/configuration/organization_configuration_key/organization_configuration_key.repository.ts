import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {OrganizationConfigurationKey} from "./organization_configuration_key.model";

@Injectable()
export class OrganizationConfigurationKeyRepository extends ExtendedRepository<OrganizationConfigurationKey> {
    constructor(readonly dataSource: DataSource) {
        super(OrganizationConfigurationKey, dataSource);
    }
}
