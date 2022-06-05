import {Field, ObjectType} from "@nestjs/graphql";

import {
    MemberRestriction,
} from "../../database";

@ObjectType()
export class MemberRestrictionEvent {
    @Field(() => Number)
    id: number;

    @Field(() => Number)
    eventType: number;

    @Field(() => String)
    message: string;

    @Field(() => MemberRestriction)
    restriction: MemberRestriction;
}
