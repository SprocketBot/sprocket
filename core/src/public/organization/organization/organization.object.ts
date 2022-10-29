import {Field, ObjectType} from "@nestjs/graphql";

import {Organization, OrganizationProfile} from "$models";

import {BaseObject} from "../../base-object";

@ObjectType()
export class SprocketOrganization extends BaseObject {
    constructor(
        {id, createdAt, updatedAt, deletedAt}: Organization,
        {name, description, websiteUrl, primaryColor, secondaryColor, logoUrl}: OrganizationProfile,
    ) {
        super();

        this.id = id;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
        this.name = name;
        this.description = description;
        this.websiteUrl = websiteUrl;
        this.primaryColor = primaryColor;
        this.secondaryColor = secondaryColor;
        this.logoUrl = logoUrl;
    }

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
