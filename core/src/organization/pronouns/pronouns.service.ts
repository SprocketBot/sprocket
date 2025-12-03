import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { FindOptionsWhere } from "typeorm";
import { Repository } from "typeorm";

import type { IrrelevantFields } from "../../database/index";
import { Pronouns } from "../../database/organization/pronouns/pronouns.model";
import { OrganizationService } from "../organization";

@Injectable()
export class PronounsService {
    constructor(
        @InjectRepository(Pronouns) private pronounsRepository: Repository<Pronouns>,
        private organizationService: OrganizationService,
    ) {
    }

    async createPronouns(organizationId: number, pronouns: Omit<Pronouns, IrrelevantFields | "organization" | "id">): Promise<Pronouns> {
        const organization = await this.organizationService.getOrganizationById(organizationId);

        const toCreate: Omit<Pronouns, IrrelevantFields | "id"> = { organization, ...pronouns };
        const created = this.pronounsRepository.create(toCreate);
        await this.pronounsRepository.save(created);

        return created;
    }

    async getPronounsById(organizationId: number, pronounsId: number): Promise<Pronouns> {
        const conditions: FindOptionsWhere<Pronouns> = {
            organization: {
                id: organizationId,
            },
            id: pronounsId,
        };
        const pronouns = await this.pronounsRepository.findOneOrFail({ where: conditions });
        return pronouns;
    }

    // TODO type this
    async getPronouns(query: FindOptionsWhere<Pronouns>, organizationId: number): Promise<Pronouns[]> {
        const pronouns = await this.pronounsRepository.find({
            where: {
                ...query,
                organization: {
                    id: organizationId,
                },
            },
        });
        return pronouns;
    }

    async deletePronouns(id: number): Promise<Pronouns> {
        const toDelete = await this.pronounsRepository.findOneOrFail({ where: { id } });
        await this.pronounsRepository.softDelete({ id: toDelete.id });
        return toDelete;
    }
}
