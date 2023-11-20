import { Field, Int, ObjectType } from "@nestjs/graphql";

import { BaseObject } from "../../types/base-object";
import type { MemberPlatformAccount } from "../database/member-platform-account.entity";

@ObjectType()
export class MemberPlatformAccountObject extends BaseObject {
    @Field(() => String)
    platform: string;

    @Field(() => Int)
    platformId: number;

    @Field(() => String)
    platformAccountId: string;
}

export function memberPlatformAccountObjectFromEntity(entity: MemberPlatformAccount): MemberPlatformAccountObject {
    return {
        id: entity.id,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
        platform: entity.platform.code,
        platformId: entity.platformId,
        platformAccountId: entity.platformAccountId,
    }
}