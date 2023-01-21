import {Field, ObjectType} from "@nestjs/graphql";

import {BaseObject} from "../../types/base-object";

@ObjectType()
export class UserObject extends BaseObject {
    @Field(() => String)
    displayName: string;

    @Field(() => String, {nullable: true})
    description?: string;
}
