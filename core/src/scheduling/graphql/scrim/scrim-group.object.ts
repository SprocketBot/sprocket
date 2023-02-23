import {Field, Int, ObjectType} from "@nestjs/graphql";

@ObjectType()
export class ScrimGroupObject {
    @Field(() => String)
    code: string;

    // List of User Ids of players in the group.
    @Field(() => [Int])
    players: number[];
}
