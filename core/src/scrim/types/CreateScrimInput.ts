import {
    Field, InputType, Int,
} from "@nestjs/graphql";

import {ScrimSettingsInput} from "./ScrimSettings";

@InputType()
export class CreateScrimInput {
    @Field()
    settings: ScrimSettingsInput;

    @Field({nullable: true})
    createGroup: boolean;

    @Field(() => Int)
    leaveAfter: number;
}
