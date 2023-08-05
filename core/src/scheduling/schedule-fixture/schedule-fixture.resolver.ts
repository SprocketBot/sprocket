import {
    Args, Query, Resolver
} from "@nestjs/graphql";
import { ScheduleFixtureObject } from "../graphql/schedule-fixture.object";
import { ScheduleFixtureRepository } from "../database/schedule-fixture.repository";
import { MatchParentRepository } from "../database/match-parent.repository";
import { Logger } from "@nestjs/common";
import { ScheduleGroupRepository } from "../database/schedule-group.repository";

@Resolver(() => ScheduleFixtureObject)
export class ScheduleFixtureResolver {
    constructor(
        private readonly scheduleFixtureRepo: ScheduleFixtureRepository,
        private readonly matchParentRepo: MatchParentRepository,
        private readonly scheduleGroupRepo: ScheduleGroupRepository,
    ) { }

    private readonly logger = new Logger(ScheduleFixtureResolver.name);

    @Query(() => ScheduleFixtureObject)
    async getFixture(@Args("id") id: number): Promise<ScheduleFixtureObject> {
        let sfo: ScheduleFixtureObject = await this.scheduleFixtureRepo.findOneOrFail({
            where: { id },
            relations: {
                homeFranchise: {
                    profile: true,
                },
                awayFranchise: {
                    profile: true,
                }
            }
        });
        
        this.logger.verbose(JSON.stringify(sfo));

        sfo.matchParents = await this.matchParentRepo.find({
            relations: {
                match: {
                    skillGroup: true,
                    gameMode: true,
                },
            },
            where: {
                fixture: { id }
            }
        });
        
        sfo.scheduleGroup = await this.scheduleGroupRepo.findOneOrFail({
            relations: {
                fixtures: true,
            },
            where: {
                fixtures : {id},
            }
        });

        this.logger.verbose(JSON.stringify(sfo));

        return sfo;
    }
}