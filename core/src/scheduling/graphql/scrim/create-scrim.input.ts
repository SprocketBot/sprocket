import {Field, InputType, Int} from "@nestjs/graphql";

import {ScrimSettingsInput} from "./scrim-settings.object";

@InputType()
export class CreateScrimInput {
    @Field(() => Int)
    gameModeId: number;

    @Field()
    settings: ScrimSettingsInput;

    @Field({nullable: true})
    createGroup: boolean;

    @Field(() => Int, {description: "Seconds until player should automatically leave scrim."})
    leaveAfter: number;

    @Field(() => Boolean, {nullable: true})
    canSaveDemos?: boolean;
}
