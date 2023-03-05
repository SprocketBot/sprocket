import {Field, ObjectType} from "@nestjs/graphql";
import type {ProgressMessage, ReplaySubmissionItem, Task} from "@sprocketbot/common";
import {ProgressStatus} from "@sprocketbot/common";

import {GqlProgress} from "../../../util/types/celery-progress";

@ObjectType()
export class SubmissionProgressMessageObject implements ProgressMessage<Task.ParseReplay> {
    @Field(() => String, {nullable: true})
    error: string | null;

    @Field(() => GqlProgress)
    progress: GqlProgress;

    @Field(() => ProgressStatus)
    status: ProgressStatus;

    @Field(() => String)
    taskId: string;

    result: ProgressMessage<Task.ParseReplay>["result"];
}

@ObjectType()
export class SubmissionItemObject implements ReplaySubmissionItem {
    @Field(() => String)
    taskId: string;

    @Field(() => String)
    originalFilename: string;

    @Field(() => SubmissionProgressMessageObject)
    progress?: SubmissionProgressMessageObject;

    inputPath: string;

    outputPath?: string;
}
