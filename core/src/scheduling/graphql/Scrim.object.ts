import {Field, Int, ObjectType} from "@nestjs/graphql";
import type {Scrim as IScrim} from "@sprocketbot/common";
import {EventTopic, ScrimStatus} from "@sprocketbot/common";

import {GameSkillGroup} from "../../franchise/database/game-skill-group.entity";
import {GameMode} from "../../game/database/game-mode.entity";
import {ScrimGame} from "./ScrimGame.object";
import {ScrimLobby} from "./ScrimLobby.object";
import {ScrimPlayer} from "./ScrimPlayer.object";
import {ScrimSettings} from "./ScrimSettings.object";

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

    @Field(() => Date, {nullable: true})
    timeoutAt?: Date;

    @Field(() => ScrimStatus)
    status: ScrimStatus;

    @Field({nullable: true})
    lockedReason?: string;

    @Field(() => Int)
    authorUserId: number;

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
