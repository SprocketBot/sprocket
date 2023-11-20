import { Field, ObjectType } from "@nestjs/graphql";

import { BaseObject } from "../../types/base-object";
import type { RosterSlot } from "../database/roster-slot.entity";
import { RosterRoleObject } from "./roster-role.object";

@ObjectType()
export class RosterSlotObject extends BaseObject {
    @Field(() => RosterRoleObject)
    rosterRole: RosterRoleObject;
}

export function rosterSlotObjectFromEntity(entity: RosterSlot): RosterSlotObject {
    return {
        id: entity.id,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
        rosterRole: entity.role,
    }
}