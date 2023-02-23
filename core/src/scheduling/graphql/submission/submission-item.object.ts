import {Field, ObjectType} from "@nestjs/graphql";
import type {ProgressMessage, SubmissionItem, Task} from "@sprocketbot/common";
import {ProgressStatus} from "@sprocketbot/common";

import {GqlProgress} from "../../../util/types/celery-progress";

@ObjectType()
export class SubmissionProgressMessageObject implements ProgressMessage<Task.ParseReplay> {
    error?: string | null;

    @Field(() => GqlProgress)
    progress: GqlProgress;

    @Field(() => ProgressStatus)
    status: ProgressStatus;

    taskId: string;

    result?: ProgressMessage<Task.ParseReplay>["result"];
}

@ObjectType()
export class SubmissionItemObject implements SubmissionItem {
    taskId: string;

    originalFilename: string;

    @Field(() => SubmissionProgressMessageObject)
    progress: SubmissionProgressMessageObject;

    inputPath: string;

    outputPath?: string;
}
