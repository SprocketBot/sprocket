import {Field, Int, ObjectType} from "@nestjs/graphql";
import type {Scrim as IScrim} from "@sprocketbot/common";
import {EventTopic, ScrimStatus} from "@sprocketbot/common";

import {GameSkillGroup} from "../../database";
import {ScrimGame} from "./ScrimGame";
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
export class Scrim implements Omit<IScrim, "id" | "status" | "players"> {
    @Field(() => String)
    id: string;

    @Field(() => ScrimGroup, {nullable: true})
    currentGroup?: ScrimGroup;

    @Field(() => ScrimStatus)
    status: ScrimStatus;

    @Field(() => Int)
    organizationId: number;

    @Field(() => [ScrimPlayer], {nullable: true})
    players?: ScrimPlayer[];

    @Field(() => Int)
    playerCount: number;

    @Field(() => Int)
    maxPlayers: number;

    @Field(() => ScrimSettings)
    settings: ScrimSettings;

    @Field(() => [ScrimGame], {nullable: true})
    games?: ScrimGame[];

    @Field(() => String, {nullable: true})
    submissionId?: string;

    @Field(() => GameSkillGroup)
    skillGroup: GameSkillGroup;

    skillGroupId: number;

    gameMode: ScrimGameMode;
}

@ObjectType()
export class ScrimEvent {
    @Field(() => Scrim)
    scrim: Scrim;

    @Field(() => String)
    event: EventTopic;
}
