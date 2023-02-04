import {Field, ObjectType} from "@nestjs/graphql";
import type {ScrimGame} from "@sprocketbot/common";

import {ScrimTeamObject} from "./scrim-team.object";

@ObjectType()
export class ScrimGameObject implements ScrimGame {
    @Field(() => [ScrimTeamObject])
    teams: ScrimTeamObject[];
}
