import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {OrganizationProfile} from "./organization-profile.entity";

@Injectable()
export class OrganizationProfileRepository extends ExtendedRepository<OrganizationProfile> {
    constructor(readonly dataSource: DataSource) {
        super(OrganizationProfile, dataSource);
    }

    async getByOrganizationId(organizationId: number): Promise<OrganizationProfile> {
        return this.findOneOrFail({where: {organizationId}});
    }
}
