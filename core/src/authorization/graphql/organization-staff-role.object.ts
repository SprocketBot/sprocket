import { Field, Int, ObjectType } from "@nestjs/graphql";

import { BaseObject } from "../../types/base-object";

@ObjectType()
export class OrganizationStaffRoleObject extends BaseObject {
    @Field(() => String)
    name: string;

    @Field(() => Int)
    ordinal: number;
}