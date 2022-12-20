import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {OrganizationConfigurationKey} from "./organization-configuration-key.entity";

@Injectable()
export class OrganizationConfigurationKeyRepository extends ExtendedRepository<OrganizationConfigurationKey> {
    constructor(readonly dataSource: DataSource) {
        super(OrganizationConfigurationKey, dataSource);
    }
}
