import { Field, ObjectType } from "@nestjs/graphql";

import { BaseObject } from "../../types/base-object";
import { RosterRoleObject } from "./roster-role.object";

@ObjectType()
export class RosterSlotObject extends BaseObject {
    @Field(() => RosterRoleObject)
    rosterRole: RosterRoleObject;
}