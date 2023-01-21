import {Field, Int, ObjectType} from "@nestjs/graphql";

import {BaseObject} from "../../types/base-object";
import type {GameMode} from "../database/game-mode.entity";

@ObjectType()
export class GameModeObject extends BaseObject {
    @Field(() => Int)
    gameId: number;

    @Field(() => String)
    code: string;

    @Field(() => String)
    description: string;

    @Field(() => Int)
    teamSize: number;

    @Field(() => Int)
    teamCount: number;
}

export function gameModeObjectFromEntity(entity: GameMode): GameModeObject {
    return {
        id: entity.id,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
        gameId: entity.gameId,
        code: entity.code,
        description: entity.description,
        teamSize: entity.teamSize,
        teamCount: entity.teamCount,
    };
}
