import {
    ResolveField, Resolver, Root,
} from "@nestjs/graphql";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import {Franchise, FranchiseProfile} from "../../database";

@Resolver(() => Franchise)
export class FranchiseResolver {
    constructor(
    @InjectRepository(Franchise)
    private readonly franchiseRepo: Repository<Franchise>,
    @InjectRepository(FranchiseProfile)
    private readonly franchiseProfileRepo: Repository<FranchiseProfile>,
    ) {
    }

    @ResolveField()
    async profile(@Root() root: Franchise): Promise<FranchiseProfile> {
        return this.franchiseProfileRepo.findOneOrFail({
            where: {
                id: root.profileId,
            },
        });
    }
}
