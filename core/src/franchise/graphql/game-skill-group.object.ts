import {Field, ObjectType} from "@nestjs/graphql";

import {BaseObject} from "../../types/base-object";

@ObjectType()
export class GameSkillGroupObject extends BaseObject {
    @Field(() => Number)
    ordinal: number;

    @Field(() => Number)
    salaryCap: number;
}
