import {Field, Int, ObjectType} from "@nestjs/graphql";

import {BaseObject} from "../../types/base-object";
import type { Player } from "../database/player.entity";
import { GameSkillGroupObject } from "./game-skill-group.object";
import { RosterSlotObject, rosterSlotObjectFromEntity } from "./roster-slot.object";

@ObjectType()
export class PlayerObject extends BaseObject {
    @Field(() => Int)
    memberId: number;

    @Field(() => GameSkillGroupObject)
    skillGroup: GameSkillGroupObject;

    @Field(() => Int)
    skillGroupId: number;

    @Field(() => Int)
    salary: number;

    @Field(() => RosterSlotObject)
    slot?: RosterSlotObject;

    @Field(() => String)
    franchiseName: string;

    @Field(() => [String])
    franchisePositions: string[];

}

export function playerObjectFromEntity(entity: Player): PlayerObject {
    return {
        id: entity.id,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
        memberId: entity.memberId,
        skillGroup: entity.skillGroup,
        skillGroupId: entity.skillGroupId,
        salary: entity.salary,
        slot: entity.slot ? rosterSlotObjectFromEntity(entity.slot) : undefined,
        franchiseName: entity.franchiseName,
        franchisePositions: entity.franchisePositions,
    }
}