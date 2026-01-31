import {Field, ObjectType} from "@nestjs/graphql";
import type {ScrimGame as IScrimGame} from "@sprocketbot/common";

import {ScrimTeam} from "./ScrimTeam";

@ObjectType()
export class ScrimGame implements IScrimGame {
    @Field(() => [ScrimTeam])
  teams: ScrimTeam[];
}
