import {Field, Int, ObjectType} from "@nestjs/graphql";

import {BaseObject} from "../../types/base-object";
import { GameSkillGroupProfileObject } from "./game-skill-group-profile.object";

@ObjectType()
export class GameSkillGroupObject extends BaseObject {
    @Field(() => Number)
    ordinal: number;

    @Field(() => Number)
    salaryCap: number;

    @Field(() => Int)
    gameId: number;

    @Field(() => Int)
    organizationId: number;
    
    @Field(() => GameSkillGroupProfileObject)
    profile: GameSkillGroupProfileObject;
}