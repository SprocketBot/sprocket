import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import type {FranchiseProfile} from "../../database";
import {Franchise} from "../../database";

@Injectable()
export class FranchiseService {
    constructor(@InjectRepository(Franchise) private readonly franchiseRepository: Repository<Franchise>) {}

    async getFranchiseProfile(franchiseId: number): Promise<FranchiseProfile> {
        const franchise = await this.franchiseRepository.findOneOrFail({where: {id: franchiseId}, relations: ["profile"] });
        return franchise.profile;
    }

    async getFranchise(franchiseId: number): Promise<Franchise> {
        return this.franchiseRepository.findOneOrFail({where: {id: franchiseId} });
    }
}
