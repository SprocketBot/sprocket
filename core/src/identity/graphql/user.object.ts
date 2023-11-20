import {Field, ObjectType} from "@nestjs/graphql";

import { MemberObject, memberObjectFromEntity } from "../../organization/graphql/member.object";
import {BaseObject} from "../../types/base-object";
import type {User} from "../database/user.entity";
import type {UserProfile} from "../database/user-profile.entity";

@ObjectType()
export class UserObject extends BaseObject {
    @Field(() => String)
    displayName: string;

    @Field(() => String, {nullable: true})
    description?: string;

    @Field(() => MemberObject)
    members?: MemberObject[];
}

export function userObjectFromEntity(entity: User, profile: UserProfile): UserObject {
    return {
        id: entity.id,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
        displayName: profile.displayName,
        description: profile.description,
        members: entity.members.map(m => memberObjectFromEntity(m, m.profile)),
    };
}
