import {
    Field, InputType, Int,
} from "@nestjs/graphql";

import type {ScrimPlayer} from "./ScrimPlayer";
import {ScrimSettingsInput} from "./ScrimSettings";

@InputType()
export class CreateLFSScrimInput {
    @Field(() => Int)
    gameModeId: number;

    @Field()
    settings: ScrimSettingsInput;

    @Field({nullable: true})
    createGroup: boolean;

    @Field(() => Int)
    leaveAfter: number;

    @Field()
    players: ScrimPlayer[];

    @Field()
    teams: ScrimPlayer[][];

    @Field(() => Int)
    numRounds: number;
}
