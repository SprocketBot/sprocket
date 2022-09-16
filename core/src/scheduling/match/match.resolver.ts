import {
    Args,
    Query,
    ResolveField, Resolver, Root,
} from "@nestjs/graphql";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import type {
    GameMode, GameSkillGroup, Round,
} from "../../database";
import {
    Match,
} from "../../database";
import {PopulateService} from "../../util/populate/populate.service";
import {MatchService} from "./match.service";

@Resolver(() => Match)
export class MatchResolver {
    constructor(
        private readonly populate: PopulateService,
        private readonly matchService: MatchService,
        @InjectRepository(Match) private readonly matchRepo: Repository<Match>,
    ) {}

    @Query(() => Match)
    async getMatchBySubmissionId(@Args("submissionId") submissionId: string): Promise<Match> {
        return this.matchService.getMatch({where: {submissionId} });
    }

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

    @ResolveField()
    async gameMode(@Root() root: Match): Promise<GameMode | undefined> {
        if (root.gameMode) return root.gameMode;
        return this.populate.populateOne(Match, root, "gameMode");
    }

    @ResolveField()
    async rounds(@Root() root: Match): Promise<Round[]> {
        if (root.rounds) return root.rounds;
        return this.populate.populateMany(Match, root, "rounds");
    }
}
