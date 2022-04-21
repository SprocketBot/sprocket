import {
    Field, InputType,
} from "@nestjs/graphql";

import {ScrimSettingsInput} from "./ScrimSettings";

@InputType()
export class CreateScrimInput {
    @Field()
    settings: ScrimSettingsInput;
}
