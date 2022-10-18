import {Inject, Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository, ProfiledRepository} from "../../extended-repositories";
import {OrganizationProfile} from "../organization_profile";
import {OrganizationProfileRepository} from "../organization_profile/organization_profile.repository";
import {Organization} from "./organization.model";

@Injectable()
export class OrganizationRepository extends ExtendedRepository<Organization> {
    constructor(readonly dataSource: DataSource) {
        super(Organization, dataSource);
    }
}

@Injectable()
export class OrganizationProfiledRepository extends ProfiledRepository<Organization, OrganizationProfile> {
    readonly profileInverseRelationshipName: "organization";

    constructor(
        @Inject(OrganizationRepository) readonly primaryRepository: OrganizationRepository,
        @Inject(OrganizationProfileRepository) readonly profileRepository: OrganizationProfileRepository,
    ) {
        super();
    }
}
