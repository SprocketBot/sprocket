import { Field, Int, ObjectType } from "@nestjs/graphql";
import { MemberRestrictionType } from "@sprocketbot/common";

import { BaseObject } from "../../types/base-object";

@ObjectType()
export class MemberRestrictionObject extends BaseObject {
    @Field(() => MemberRestrictionType)
    type: MemberRestrictionType;

    @Field(() => Date)
    expiration: Date;

    @Field(() => String)
    reason: string;

    @Field(() => Date)
    manualExpiration?: Date;

    @Field(() => String)
    manualExpirationReason?: string;

    @Field(() => Boolean)
    forgiven: boolean;

    @Field(() => Int)
    memberId: number;
} 