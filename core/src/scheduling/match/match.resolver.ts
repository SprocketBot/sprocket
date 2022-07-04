import {
    ResolveField, Resolver, Root,
} from "@nestjs/graphql";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import type {GameSkillGroup} from "../../database";
import {
    Match,
} from "../../database";
import {PopulateService} from "../../util/populate/populate.service";

@Resolver(() => Match)
export class MatchResolver {
    constructor(
        private readonly populate: PopulateService,
        @InjectRepository(Match)
        private readonly matchRepo: Repository<Match>,
    ) {}

    @ResolveField()
    async skillGroup(@Root() root: Match): Promise<GameSkillGroup> {
        if (root.skillGroup) return root.skillGroup;
        return this.populate.populateOneOrFail(Match, root, "skillGroup");
    }

    @ResolveField()
    async submitted(@Root() root: Match): Promise<boolean> {
        return this.matchRepo.findOneOrFail({
            where: {
                id: root.id,
            },
            relations: ["rounds"],
        }).then(v => v.rounds.length > 0 || v.isDummy);
    }
}
