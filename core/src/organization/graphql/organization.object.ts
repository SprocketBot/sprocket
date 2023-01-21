import {Field, ObjectType} from "@nestjs/graphql";

import {BaseObject} from "../../types/base-object";

@ObjectType()
export class OrganizationObject extends BaseObject {
    @Field(() => String)
    name: string;

    @Field(() => String)
    description: string;

    @Field(() => String)
    websiteUrl: string;

    @Field(() => String)
    primaryColor: string;

    @Field(() => String)
    secondaryColor: string;

    @Field(() => String, {nullable: true})
    logoUrl?: string;
}
