import {Field, InputType, Int} from "@nestjs/graphql";

@InputType()
export class CreateTestScrimInput {
    @Field(() => Int)
    gameModeId: number;

    @Field(() => Int)
    skillGroupId: number;
}
