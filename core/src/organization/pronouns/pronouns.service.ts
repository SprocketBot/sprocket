import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {FindConditions} from "typeorm";
import {Repository} from "typeorm";

import type {IrrelevantFields} from "../../database";
import {Pronouns} from "../../database";
import {OrganizationService} from "../organization";

@Injectable()
export class PronounsService {
    constructor(
        @InjectRepository(Pronouns) private pronounsRepository: Repository<Pronouns>,
        private organizationService: OrganizationService,
    ) {
    }

    async createPronouns(organizationId: number, pronouns: Omit<Pronouns, IrrelevantFields | "organization" | "id">): Promise<Pronouns> {
        const organization = await this.organizationService.getOrganizationById(organizationId);

        const toCreate: Omit<Pronouns, IrrelevantFields | "id"> = {organization, ...pronouns};
        const created = this.pronounsRepository.create(toCreate);
        await this.pronounsRepository.save(created);

        return created;
    }

    async getPronounsById(organizationId: number, pronounsId: number): Promise<Pronouns> {
        const conditions: FindConditions<Pronouns> = {
            organization: {
                id: organizationId,
            },
            id: pronounsId,
        };
        const pronouns = await this.pronounsRepository.findOneOrFail(conditions);
        return pronouns;
    }

    // TODO type this
    async getPronouns(query: { organization: { id: number } }): Promise<Pronouns[]> {
        const organization = await this.organizationService.getOrganizationById(query.organization.id);
        const pronouns = await this.pronounsRepository.find({organization: { id: organization.id } });
        return pronouns;
    }

    async deletePronouns(id: number): Promise<Pronouns> {
        const toDelete = await this.pronounsRepository.findOneOrFail(id);
        await this.pronounsRepository.softDelete({ id: toDelete.id });
        return toDelete;
    }
}
