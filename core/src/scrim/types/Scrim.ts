import {
    Field, Int, ObjectType,
} from "@nestjs/graphql";
import {
    EventTopic, Scrim as IScrim, ScrimStatus,
} from "@sprocketbot/common";

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
export class Scrim implements Omit<IScrim, "id" | "status" | "players"> {
    @Field(() => String)
    id: string;

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
    submissionGroupId?: string | undefined;
    
    gameMode: ScrimGameMode;

    skillGroupId: number;

    constructor(data: IScrim) {
        this.id = data.id;
        this.status = data.status;
        this.players = data.players;
        this.playerCount = data.players.length;
        this.settings = data.settings;
        this.games = data.games;
        this.gameMode = data.gameMode;
        this.submissionGroupId = data.submissionGroupId;
    }
}

@ObjectType()
export class ScrimEvent {
    @Field(() => Scrim)
    scrim: Scrim;

    @Field(() => String)
    event: EventTopic;
}
