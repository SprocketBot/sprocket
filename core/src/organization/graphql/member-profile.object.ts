import { Field, ObjectType } from "@nestjs/graphql";

import { BaseObject } from "../../types/base-object";

@ObjectType()
export class MemberProfileObject extends BaseObject {
    @Field(() => String)
    name: string;
}