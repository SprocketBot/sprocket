import {Field, ObjectType} from "@nestjs/graphql";

import {MemberRestrictionType} from "../../database";

@ObjectType()
export class MemberRestrictionEvent {
    @Field(() => Number)
    id: number;

    @Field(() => Number)
    eventType: number;

    @Field(() => String)
    message: string;

    @Field(() => MemberRestrictionType)
    type: MemberRestrictionType;

    @Field(() => Date)
    expiration: Date;

    @Field()
    reason: string;

    @Field(() => Date, {nullable: true})
    manualExpiration?: Date;

    @Field({nullable: true})
    manualExpirationReason?: string;

    @Field()
    memberId: number;
}
