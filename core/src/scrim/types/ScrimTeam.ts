import {Field, ObjectType} from "@nestjs/graphql";
import type {ScrimTeam as IScrimTeam} from "@sprocketbot/common";

import {ScrimPlayer} from "./ScrimPlayer";

@ObjectType()
export class ScrimTeam implements IScrimTeam {
    @Field(() => [ScrimPlayer])
  players: ScrimPlayer[];
}
