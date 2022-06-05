import {Field, ObjectType} from "@nestjs/graphql";

import type {ISubmissionRejection} from "../replay-submission/types/submission-rejection.types";

@ObjectType()
export class SubmissionRejection implements Omit<ISubmissionRejection, "rejectedItems"> {
    @Field()
    playerId: number;

    @Field()
    reason: string;
}
