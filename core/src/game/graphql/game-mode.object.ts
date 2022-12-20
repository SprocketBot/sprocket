import {Field, Int, ObjectType} from "@nestjs/graphql";

import {BaseObject} from "../../types/base-object";

@ObjectType()
export class GameModeObject extends BaseObject {
    @Field(() => Int)
    gameId: number;

    @Field(() => String)
    code: string;

    @Field(() => String)
    description: string;

    @Field(() => Int)
    teamSize: number;

    @Field(() => Int)
    teamCount: number;
}
