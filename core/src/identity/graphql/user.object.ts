import {Field, ObjectType} from "@nestjs/graphql";

import {BaseObject} from "../../types/base-object";
import type {User} from "../database/user.entity";
import type {UserProfile} from "../database/user-profile.entity";

@ObjectType()
export class UserObject extends BaseObject {
    @Field(() => String)
    displayName: string;

    @Field(() => String, {nullable: true})
    description?: string;
}

export function userObjectFromEntity(entity: User, profile: UserProfile): UserObject {
    return {
        id: entity.id,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
        displayName: profile.displayName,
        description: profile.description,
    };
}
