import {Field, ObjectType} from "@nestjs/graphql";

import {BaseObject} from "../../types/base-object";
import type {Organization} from "../database/organization.entity";
import type {OrganizationProfile} from "../database/organization-profile.entity";

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

export function organizationObjectFromEntity(entity: Organization, profile: OrganizationProfile): OrganizationObject {
    return {
        id: entity.id,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
        name: profile.name,
        description: profile.description,
        websiteUrl: profile.websiteUrl,
        primaryColor: profile.primaryColor,
        secondaryColor: profile.secondaryColor,
        logoUrl: profile.logoUrl,
    };
}
