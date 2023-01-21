import {Field, InputType, Int} from "@nestjs/graphql";

@InputType()
export class JoinScrimInput {
    @Field()
    scrimId: string;

    @Field(() => Int)
    leaveAfter: number;

    @Field({nullable: true})
    groupKey?: string;

    @Field({nullable: true})
    createGroup?: boolean;

    @Field({nullable: true})
    canSaveDemos?: boolean;
}
