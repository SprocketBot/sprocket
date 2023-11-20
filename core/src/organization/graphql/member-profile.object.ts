import { Field, ObjectType } from "@nestjs/graphql";

import { BaseObject } from "../../types/base-object";
import type { MemberProfile } from "../database/member-profile.entity";

@ObjectType()
export class MemberProfileObject extends BaseObject {
    @Field(() => String)
    name: string;
}

export function memberProfileObjectFromEntity(entity: MemberProfile): MemberProfileObject {
    return {
        id: entity.id,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
        name: entity.name
    }
}