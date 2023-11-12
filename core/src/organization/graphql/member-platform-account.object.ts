import { Field, ObjectType } from "@nestjs/graphql";

import { BaseObject } from "../../types/base-object";

@ObjectType()
export class MemberPlatformAccountObject extends BaseObject {
    @Field(() => String)
    platform: string;

    @Field(() => String)
    platformId: string;

    @Field(() => String)
    platformAccountId: string;
}