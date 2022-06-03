import {Field, ObjectType} from "@nestjs/graphql";

@ObjectType()
export class MemberEvent {
    @Field(() => Number)
    id: number;

    @Field(() => String)
    message: string;
}
