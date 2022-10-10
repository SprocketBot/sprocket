import {Field, InputType, Int, ObjectType} from "@nestjs/graphql";
import type {ScrimSettings as IScrimSettings} from "@sprocketbot/common";
import {ScrimMode} from "@sprocketbot/common";

import type {ScrimLobby} from "./ScrimLobby";

@ObjectType()
export class ScrimSettings implements IScrimSettings {
    @Field(() => Int)
    teamCount: number;

    @Field(() => Int)
    teamSize: number;

    @Field(() => ScrimMode)
    mode: ScrimMode;

    @Field(() => Boolean)
    competitive: boolean;

    @Field(() => Boolean)
    observable: boolean;

    @Field(() => Int)
    checkinTimeout: number;

    lobby?: ScrimLobby;
}

@InputType()
export class ScrimSettingsInput {
    @Field(() => Int)
    gameModeId: number;

    @Field(() => ScrimMode)
    mode: ScrimMode;

    @Field(() => Boolean)
    competitive: boolean;

    @Field(() => Boolean)
    observable: boolean;
}
