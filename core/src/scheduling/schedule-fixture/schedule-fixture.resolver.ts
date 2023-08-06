import {
    Args, Query, Resolver
} from "@nestjs/graphql";
import { ScheduleFixture } from "../database/schedule-fixture.entity";
import { ScheduleFixtureObject } from "../graphql/schedule-fixture.object";
import { ScheduleFixtureRepository } from "../database/schedule-fixture.repository";
import { MatchParentRepository } from "../database/match-parent.repository";
import { Logger } from "@nestjs/common";
import { ScheduleGroupRepository } from "../database/schedule-group.repository";
import { GameSkillGroupRepository } from "../../franchise/database/game-skill-group.repository";
import { GameSkillGroupProfileRepository } from "../../franchise/database/game-skill-group-profile.repository";

@Resolver(() => ScheduleFixtureObject)
export class ScheduleFixtureResolver {
    constructor(
        private readonly scheduleFixtureRepo: ScheduleFixtureRepository,
        private readonly matchParentRepo: MatchParentRepository,
        private readonly scheduleGroupRepo: ScheduleGroupRepository,
        private readonly gameSkillGroupRepo: GameSkillGroupRepository,
        private readonly gsgProfileRepo: GameSkillGroupProfileRepository,
    ) { }

    private readonly logger = new Logger(ScheduleFixtureResolver.name);

    @Query(() => ScheduleFixtureObject)
    async getFixture(@Args("id") id: number): Promise<ScheduleFixtureObject> {
        let sfo: ScheduleFixture = await this.scheduleFixtureRepo.findOneOrFail({
            where: { id },
            relations: {
                homeFranchise: {
                    profile: {
                        photo: true, 
                    }
                },
                awayFranchise: {
                    profile: {
                        photo: true,
                    }
                }
            }
        });
        
        sfo.matchParents = await this.matchParentRepo.find({
            relations: {
                match: {
                    skillGroup: {
                        profile: true,
                    },
                    gameMode: true,
                },
            },
            where: {
                fixture: { id }
            }
        });
        
        // const skillGroupObjectsPromises = await sfo.matchParents.map(async (mp) => {
        //     const sg = await this.gameSkillGroupRepo.findOneOrFail({
        //         where: { id: mp.match.skillGroup.id }
        //     });
        //     const sgp = await this.gsgProfileRepo.findOneOrFail({
        //         where: { skillGroupId: mp.match.skillGroup.id }
        //     });
        //     
        //     return gameSkillGroupObjectFromEntity(sg, sgp);
        // });

        // const skillGroupObjects = await Promise.all(skillGroupObjectsPromises);
        // let matchParents: MatchParentObject[] = [];
        // for (let i = 0; i < sfo.matchParents.length; i++) {
        //     const mp = sfo.matchParents[i];
        //     const newMp: MatchParentObject = {
        //         id: mp.id,
        //         match: {
        //             id: mp.match.id,
        //             isDummy: mp.match.isDummy,
        //             skillGroup: skillGroupObjects[i],
        //             skillGroupId: mp.match.skillGroupId,
        //             submissionStatus: mp.match.submissionStatus,
        //             canRatify: mp.match.canRatify,
        //             canSubmit: mp.match.canSubmit,
        //             gameMode: mp.match.gameMode,
        //         }                
        //     };
        //     matchParents.push(newMp);
        // }

        sfo.scheduleGroup = await this.scheduleGroupRepo.findOneOrFail({
            relations: {
                fixtures: {
                    matchParents: {
                        match: true,
                    },
                },
            },
            where: {
                fixtures : {id},
            }
        });

        return sfo;
    }
}

