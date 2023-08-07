import { Field, Int, ObjectType } from "@nestjs/graphql";
import { GameModeObject } from "../../../game/graphql/game-mode.object";
import { GameSkillGroupObject } from "../../../franchise/graphql/game-skill-group.object";
import { MatchSubmissionStatus } from "../../match/match.service";

@ObjectType()
export class MatchObject {
    @Field(() => Int)
    id: number;
    
    @Field(() => Boolean)
    isDummy: boolean;

    //@Field(() => InvalidationObject)
    //invalidation?: InvalidationObject;

    @Field(() => GameSkillGroupObject)
    skillGroup: GameSkillGroupObject;

    @Field(() => Int)
    skillGroupId: number;

    //@Field
    //rounds: Round[];

    // @OneToOne(() => MatchParent, mp => mp.match)
    // @JoinColumn()
    // matchParent: MatchParent;

    @Field(() => String, {nullable: true})
    submissionId?: string;

    @Field(() => String, {nullable: true})
    submissionStatus: MatchSubmissionStatus;

    @Field(() => Boolean)
    canSubmit: boolean;

    @Field(() => Boolean)
    canRatify: boolean;

    @Field(() => GameModeObject)
    gameMode: GameModeObject;
}
