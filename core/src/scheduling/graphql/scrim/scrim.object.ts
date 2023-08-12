import {Field, Int, ObjectType, registerEnumType} from "@nestjs/graphql";
import type {Scrim} from "@sprocketbot/common";
import {EventTopic, ScrimStatus} from "@sprocketbot/common";

import {GameSkillGroupObject} from "../../../franchise/graphql/game-skill-group.object";
import {GameModeObject} from "../../../game/graphql/game-mode.object";
import {UserObject} from "../../../identity/graphql/user.object";
import {OrganizationObject} from "../../../organization/graphql/organization.object";
import {ScrimGameObject} from "./scrim-game.object";
import {ScrimGroupObject} from "./scrim-group.object";
import {ScrimLobbyObject} from "./scrim-lobby.object";
import {ScrimPlayerObject} from "./scrim-player.object";
import {ScrimSettingsObject} from "./scrim-settings.object";

registerEnumType(ScrimStatus, {name: "ScrimStatus"});

@ObjectType()
export class ScrimObject implements Scrim {
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

    @Field(() => UserObject)
    author?: UserObject;

    @Field(() => Int)
    organizationId: number;

    @Field(() => OrganizationObject)
    organization?: OrganizationObject;

    @Field(() => Int)
    gameModeId: number;

    @Field(() => GameModeObject)
    gameMode?: GameModeObject;

    @Field(() => Int)
    skillGroupId: number;

    @Field(() => GameSkillGroupObject)
    skillGroup?: GameSkillGroupObject;

    @Field(() => String, {nullable: true})
    submissionId?: string;

    @Field(() => [ScrimPlayerObject], {nullable: true})
    players: ScrimPlayerObject[];

    @Field(() => [ScrimGameObject], {nullable: true})
    games?: ScrimGameObject[];

    @Field(() => ScrimLobbyObject, {nullable: true})
    lobby?: ScrimLobbyObject;

    @Field(() => ScrimSettingsObject)
    settings: ScrimSettingsObject;

    // Helpers

    @Field(() => ScrimGroupObject, {nullable: true})
    currentGroup?: ScrimGroupObject;

    @Field(() => Int)
    playerCount: number;

    @Field(() => Int)
    maxPlayers: number;
    
    @Field(() => Boolean, {nullable: true})
    observable?: boolean;
}

// TODO: Get rid of this?
@ObjectType()
export class ScrimEvent {
    @Field(() => ScrimObject)
    scrim: ScrimObject;

    @Field(() => String)
    event: EventTopic;
}
