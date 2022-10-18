import {Field, ObjectType} from "@nestjs/graphql";

import {MemberRestriction} from "$models";

@ObjectType()
export class MemberRestrictionEvent extends MemberRestriction {
    @Field(() => Number)
    eventType: number;
}
