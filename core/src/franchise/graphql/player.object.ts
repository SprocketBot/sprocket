import {Field, Int, ObjectType} from "@nestjs/graphql";

import {BaseObject} from "../../types/base-object";
import { GameSkillGroupObject } from "./game-skill-group.object";
import { RosterSlotObject } from "./roster-slot.object";

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