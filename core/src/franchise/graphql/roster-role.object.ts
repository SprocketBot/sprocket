import { Field, ObjectType } from "@nestjs/graphql";

import { BaseObject } from "../../types/base-object";

@ObjectType()
export class RosterRoleObject extends BaseObject {
    @Field(() => String)
    code: string;

    @Field(() => String)
    description: string;
}