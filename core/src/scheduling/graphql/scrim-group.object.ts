import {Field, ObjectType} from "@nestjs/graphql";

@ObjectType()
export class ScrimGroupObject {
    @Field(() => String)
    code: string;

    // TODO: THIS!
    @Field(() => [String])
    players: string[];
}
