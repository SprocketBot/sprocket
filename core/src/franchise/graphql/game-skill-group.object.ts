import {Field, Int, ObjectType} from "@nestjs/graphql";

import {BaseObject} from "../../types/base-object";
import type {GameSkillGroup} from "../database/game-skill-group.entity";
import type {GameSkillGroupProfile} from "../database/game-skill-group-profile.entity";
import { GameSkillGroupProfileObject } from "./game-skill-group-profile.object";

@ObjectType()
export class GameSkillGroupObject extends BaseObject {
    @Field(() => Number)
    ordinal: number;

    @Field(() => Number)
    salaryCap: number;

    @Field(() => Int)
    gameId: number;

    @Field(() => Int)
    organizationId: number;
    
    @Field(() => GameSkillGroupProfileObject)
    profile: GameSkillGroupProfileObject;
}

// export function gameSkillGroupObjectFromEntity(
//     entity: GameSkillGroup,
//     profile: GameSkillGroupProfile,
// ): GameSkillGroupObject {
//     return {
//         id: entity.id,
//         createdAt: entity.createdAt,
//         updatedAt: entity.updatedAt,
//         deletedAt: entity.deletedAt,
//         ordinal: entity.ordinal,
//         salaryCap: entity.salaryCap,
//         gameId: entity.gameId,
//         organizationId: entity.organizationId,
//         code: profile.code,
//         description: profile.description,
//         color: profile.color,
//     };
// }
