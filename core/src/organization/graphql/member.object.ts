import {Field, Int,ObjectType} from "@nestjs/graphql";

import { PlayerObject, playerObjectFromEntity } from "../../franchise/graphql/player.object";
import {BaseObject} from "../../types/base-object";
import type { Member } from "../database/member.entity";
import type { MemberProfile } from "../database/member-profile.entity";
import { MemberPlatformAccountObject, memberPlatformAccountObjectFromEntity } from "./member-platform-account.object";
import { MemberProfileObject, memberProfileObjectFromEntity } from "./member-profile.object";
import { MemberRestrictionObject } from "./member-restriction.object";

@ObjectType()
export class MemberObject extends BaseObject {
    @Field(() => Int)
    id: number

    @Field(() => [MemberPlatformAccountObject])
    platformAccounts: MemberPlatformAccountObject[];

    @Field(() => MemberProfileObject)
    profile: MemberProfileObject;

    @Field(() => [PlayerObject])
    players: PlayerObject[];

    @Field(() => Int)
    restrictions: MemberRestrictionObject;
}

export function memberObjectFromEntity(entity: Member, profile: MemberProfile): MemberObject {
    const tempAccounts = entity.platformAccounts ?? [];
    const tempPlayers = entity.players ?? [];

    return {
        id: entity.id,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
        platformAccounts: tempAccounts.map(pa => memberPlatformAccountObjectFromEntity(pa)),
        profile: memberProfileObjectFromEntity(profile),
        players: tempPlayers.map(p => playerObjectFromEntity(p)),
        restrictions: entity.restrictions,
    }
}