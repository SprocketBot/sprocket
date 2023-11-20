import {Field, Int,ObjectType} from "@nestjs/graphql";

import { PlayerObject } from "../../franchise/graphql/player.object";
import {BaseObject} from "../../types/base-object";
import type { Member } from "../database/member.entity";
import type { MemberProfile } from "../database/member-profile.entity";
import { MemberPlatformAccountObject } from "./member-platform-account.object";
import { MemberProfileObject } from "./member-profile.object";
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

    @Field(() => Int)
    organizationStaffSeats: OrganizationStaffSeat[];
}

// export function memberObjectFromEntity(entity: Member, profile: MemberProfile): MemberObject {
    // return {
        // id: entity.id,
        // createdAt: entity.createdAt,
        // updatedAt: entity.updatedAt,
        // deletedAt: entity.deletedAt,
        // players: entity.players,

        // profile: profile,
    // }
// }