import {Field, Int, ObjectType, registerEnumType} from "@nestjs/graphql";
import type {Scrim as IScrim} from "@sprocketbot/common";
import {EventTopic, ScrimStatus} from "@sprocketbot/common";

import {GameSkillGroupObject} from "../../franchise/graphql/game-skill-group.object";
import {GameModeObject} from "../../game/graphql/game-mode.object";
import {ScrimGame} from "./ScrimGame.object";
import {ScrimLobby} from "./ScrimLobby.object";
import {ScrimPlayer} from "./ScrimPlayer.object";
import {ScrimSettings} from "./ScrimSettings.object";

registerEnumType(ScrimStatus, {name: "ScrimStatus"});

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

    @Field(() => GameModeObject)
    gameMode: GameModeObject;

    @Field(() => Int)
    skillGroupId: number;

    @Field(() => GameSkillGroupObject)
    skillGroup: GameSkillGroupObject;

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
