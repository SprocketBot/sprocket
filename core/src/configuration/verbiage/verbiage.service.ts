import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import {Verbiage, VerbiageCode} from "../../database";
import {OrganizationService} from "../../organization/organization";

@Injectable()
export class VerbiageService {
    constructor(
        @InjectRepository(Verbiage) private verbiageRepository: Repository<Verbiage>,
        @InjectRepository(VerbiageCode) private verbiageCodeRepository: Repository<VerbiageCode>,
        private organizationService: OrganizationService,
    ) {}

    /**
     * Insert or update a verbiage.
     * @param term The new verbiage.
     * @param organizationId The id of the organization the verbiage belongs to.
     * @param verbiageCode The verbiage code.
     * @returns The inserted or updated verbiage.
     */
    async upsertVerbiage(
        term: string,
        organizationId: number,
        verbiageCode: string,
    ): Promise<Verbiage> {
        const organization = await this.organizationService.getOrganizationById(organizationId);
        const code = await this.verbiageCodeRepository.findOneOrFail({where: {code: verbiageCode} });

        let verbiage = await this.verbiageRepository.findOne({
            where: {
                organization: {
                    id: organization.id,
                },
                code: {
                    id: code.id,
                },
            },
        });

        if (verbiage) verbiage = this.verbiageRepository.merge(verbiage, {
            term, organization, code,
        });
        else verbiage = this.verbiageRepository.create({
            term, organization, code,
        });

        await this.verbiageRepository.save(verbiage);
        return verbiage;
    }

    /**
     * Finds verbiage that match a given query.
     * @param query A query to search for matching Verbiage.
     * @returns The verbiage that matches the query.
     */
    // TODO type this
    async getVerbiage(query: {organizationId: number; code: string;}): Promise<string> {
        const verbiage = await this.verbiageRepository.findOne({
            where: {
                organizationId: query.organizationId,
                code: {
                    code: query.code,
                },
            },
        });
        if (verbiage) return verbiage.term;

        const defaultCode = await this.verbiageCodeRepository.findOneOrFail(query.code);
        return defaultCode.default;
    }

    /**
     * Deletes a verbiage.
     * @param organizationId The id of the organization the verbiage belongs to.
     * @param code The verbiage code.
     * @returns The deleted verbiage.
     */
    async deleteVerbiage(organizationId: number, code: string): Promise<Verbiage> {
        const toDelete = await this.verbiageRepository.findOneOrFail({
            where: {
                organizationId,
                code,
            },
        });
        
        await this.verbiageRepository.delete({id: toDelete.id});
        return toDelete;
    }
}
