import {Field, ObjectType} from "@nestjs/graphql";

import {MemberRestriction} from "$db/organization/member_restriction/member_restriction.model";

@ObjectType()
export class MemberRestrictionEvent extends MemberRestriction {
    @Field(() => Number)
  eventType: number;
}
