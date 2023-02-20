import {Field, ObjectType} from "@nestjs/graphql";
import type {ScrimTeam} from "@sprocketbot/common";

import {ScrimPlayerObject} from "./scrim-player.object";

@ObjectType()
export class ScrimTeamObject implements ScrimTeam {
    @Field(() => [ScrimPlayerObject])
    players: ScrimPlayerObject[];
}
