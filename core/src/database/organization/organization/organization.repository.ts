import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository, ProfiledRepository} from "../../repositories";
import {OrganizationProfile} from "../organization_profile";
import {Organization} from "./organization.model";

@Injectable()
export class OrganizationRepository extends ExtendedRepository<Organization> {
    constructor(readonly dataSource: DataSource) {
        super(Organization, dataSource);
    }
}

@Injectable()
export class OrganizationProfiledRepository extends ProfiledRepository<Organization, OrganizationProfile> {
    readonly primaryRepository: ExtendedRepository<Organization>;

    readonly profileRepository: ExtendedRepository<OrganizationProfile>;

    readonly profileInverseRelationshipName: "organization";
}
