import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories";
import {OrganizationProfile} from "./organization_profile.model";

@Injectable()
export class OrganizationProfileRepository extends ExtendedRepository<OrganizationProfile> {
    constructor(readonly dataSource: DataSource) {
        super(OrganizationProfile, dataSource);
    }

    async getByOrganizationId(organizationId: number): Promise<OrganizationProfile> {
        return this.findOneOrFail({where: {organizationId}});
    }
}
