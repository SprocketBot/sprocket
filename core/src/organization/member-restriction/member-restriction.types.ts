import {Field, ObjectType} from "@nestjs/graphql";

// For some reason this doesn't exist on $models
// eslint-disable-next-line no-restricted-imports
import {MemberRestriction} from "../../database/organization/member_restriction/member_restriction.model";

@ObjectType()
export class MemberRestrictionEvent extends MemberRestriction {
    @Field(() => Number)
    eventType: number;
}
