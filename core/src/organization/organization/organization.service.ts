import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {FindManyOptions, FindOneOptions} from "typeorm";
import {Repository} from "typeorm";

import type {IrrelevantFields} from "../../database";
import {Organization} from "../../database/organization/organization/organization.model";
import {OrganizationProfile} from "../../database/organization/organization_profile/organization_profile.model";

@Injectable()
export class OrganizationService {
    constructor(
        @InjectRepository(Organization) private organizationRepository: Repository<Organization>,
        @InjectRepository(OrganizationProfile) private organizationProfileRepository: Repository<OrganizationProfile>,
    ) { }

    /**
     * Creates an Organization with a given profile.
     * @param organizationProfile The profile to give the newly created organization.
     * @returns A promise that resolves to the newly created organization.
     */
    async createOrganization(organizationProfile: Omit<OrganizationProfile, IrrelevantFields | "id" | "organization">): Promise<Organization> {
        const profile = this.organizationProfileRepository.create(organizationProfile);
        const organization = this.organizationRepository.create({profile});

        await this.organizationProfileRepository.save(organization.profile);
        await this.organizationRepository.save(organization);
        return organization;
    }

    /**
     * Finds an Organization by its id and fails if not found.
     * @param id The id of the organization to find.
     * @retusn The organization with the given id, if found.
     */
    async getOrganizationById(id: number): Promise<Organization> {
        return this.organizationRepository.findOneOrFail({where: {id} });
    }

    /**
     * Finds Organizations that match a given query.
     * @param query A query to search for matching Organzations.
     * @returns An array containg Organizations matching the given query.
     */
    async getOrganization(query: FindOneOptions<OrganizationProfile>): Promise<Organization> {
        const organizationProfile = await this.organizationProfileRepository.findOneOrFail(query);
        return organizationProfile.organization;
    }

    /**
     * Finds Organizations that match a given query.
     * @param query A query to search for matching Organzations.
     * @returns An array containg Organizations matching the given query.
     */
    async getOrganizations(query?: FindManyOptions<OrganizationProfile>): Promise<Organization[]> {
        const organizationProfiles = await this.organizationProfileRepository.find(query);
        return organizationProfiles.map(op => op.organization);
    }

    /**
     * Updates the OrganizationProfile of an Organization with a given id.
     * @param organizationId The id of the organization's profile to update.
     * @param data The fields and values on the OrganizationProfile to update.
     * @returns The updated OrganizationProfile.
     */
    async updateOrganizationProfile(organizationId: number, data: Omit<Partial<OrganizationProfile>, "organization">): Promise<OrganizationProfile> {
        let {profile} = await this.organizationRepository.findOneOrFail({
            relations: {profile: true},
            where: {id: organizationId},
        });
        profile = this.organizationProfileRepository.merge(profile, data);
        await this.organizationProfileRepository.save(profile);
        return profile;
    }

    /**
     * Deletes an Organization with a given id from the database.
     * @param id The id of the Organization to delete.
     * @returns The deleted Organization.
     */
    async deleteOrganization(id: number): Promise<Organization> {
        const toDelete = await this.organizationRepository.findOneOrFail({
            where: {id},
            relations: {profile: true},
        });
        await this.organizationRepository.delete({id});
        await this.organizationProfileRepository.delete({id: toDelete.profile.id});
        return toDelete;
    }

    async getOrganizationProfileForOrganization(organizationId: number): Promise<OrganizationProfile> {
        const org = await this.organizationRepository.findOneOrFail({where: {id: organizationId}, relations: {profile: true} });
        return org.profile;
    }
}
