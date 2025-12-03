import {
    Field, Int, ObjectType,
} from "@nestjs/graphql";
import type {Scrim as IScrim} from "@sprocketbot/common";
import {
    EventTopic, ScrimStatus,
} from "@sprocketbot/common";

import type { GameMode } from "../../database/game/game_mode/game_mode.model";
import type { GameSkillGroup } from "../../database/franchise/game_skill_group/game_skill_group.model";
import {ScrimGame} from "./ScrimGame";
import {ScrimLobby} from "./ScrimLobby";
import {ScrimPlayer} from "./ScrimPlayer";
import {ScrimSettings} from "./ScrimSettings";

@ObjectType()
export class ScrimGameMode {
    @Field(() => Int)
    id: number;

    @Field(() => String)
    description: string;
}

@ObjectType()
export class ScrimGroup {
    @Field(() => String)
    code: string;

    @Field(() => [String])
    players: string[];
}

@ObjectType()
export class Scrim implements IScrim {
    @Field(() => String)
    id: string;

    @Field(() => Date)
    createdAt: Date;

    @Field(() => Date)
    updatedAt: Date;

    @Field(() => ScrimStatus)
    status: ScrimStatus;

    @Field(() => Int)
    authorId: number;
    
    @Field(() => Int)
    organizationId: number;

    @Field(() => Int)
    gameModeId: number;

    @Field(() => GameMode)
    gameMode: GameMode;

    @Field(() => Int)
    skillGroupId: number;

    @Field(() => GameSkillGroup)
    skillGroup: GameSkillGroup;

    @Field(() => String, {nullable: true})
    submissionId?: string;

    @Field(() => [ScrimPlayer], {nullable: true})
    players: ScrimPlayer[];

    @Field(() => [ScrimGame], {nullable: true})
    games?: ScrimGame[];

    @Field(() => ScrimLobby, {nullable: true})
    lobby?: ScrimLobby;

    @Field(() => ScrimSettings)
    settings: ScrimSettings;

    // Helpers

    @Field(() => ScrimGroup, {nullable: true})
    currentGroup?: ScrimGroup;

    @Field(() => Int)
    playerCount: number;

    @Field(() => Int)
    maxPlayers: number;
}

@ObjectType()
export class ScrimEvent {
    @Field(() => Scrim)
    scrim: Scrim;

    @Field(() => String)
    event: EventTopic;
}
