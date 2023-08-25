import {Field, InputType, Int} from "@nestjs/graphql";

@InputType()
export class JoinScrimInput {
    @Field()
    scrimId: string;

    @Field(() => Int)
    leaveAfter: number;

    @Field({nullable: true, description: "Key provided to a group creator; used to place players onto preferred teams"})
    groupKey?: string;

    @Field({
        nullable: true,
        description:
            "Specifies that the user would like to create a group; a group key will be included in the response",
    })
    createGroup?: boolean;

    @Field({
        nullable: true,
        description:
            "Specifies that the player has opted to save replays, at least one member of a scrim must provide this flag",
    })
    canSaveDemos?: boolean;
}
