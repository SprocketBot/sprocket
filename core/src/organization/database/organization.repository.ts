import {Inject, Injectable} from "@nestjs/common";
import type {FindOneOptions} from "typeorm";
import {DataSource} from "typeorm";

import {ExtendedRepository, ProfiledRepository} from "../../types/extended-repositories";
import {Organization} from "./organization.entity";
import {OrganizationProfileRepository} from "./organization_profile.repository";
import type {OrganizationProfile} from "./organization-profile.entity";

@Injectable()
export class OrganizationRepository extends ExtendedRepository<Organization> {
    constructor(readonly dataSource: DataSource) {
        super(Organization, dataSource);
    }

    async getByName(name: string, options?: FindOneOptions<Organization>): Promise<Organization> {
        return this.findOneOrFail(Object.assign({where: {profile: {name}}, relations: {profile: true}}, options));
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
