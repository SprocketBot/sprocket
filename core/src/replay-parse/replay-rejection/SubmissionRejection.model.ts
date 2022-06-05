import {Field, ObjectType} from "@nestjs/graphql";

@ObjectType()
export class SubmissionRejection {
    @Field()
    playerName: string;

    @Field()
    reason: string;

    @Field(() => Date)
    rejectedAt: Date;
}
