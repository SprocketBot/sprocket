import {
    Field, ObjectType,
} from "@nestjs/graphql";
import type {
    ProgressMessage, Task, TaskResult,
} from "@sprocketbot/common";
import {
    BallchasingResponse, Progress as IProgress, ProgressStatus,
} from "@sprocketbot/common";
import GraphQLJSON from "graphql-type-json";

import {Progress} from "../util/types/celery-progress";

@ObjectType()
export class ParseReplayResult implements TaskResult<Task.ParseReplay> {
    @Field(() => GraphQLJSON)
    data: BallchasingResponse;
}

@ObjectType()
export class ReplayParseProgress implements ProgressMessage<Task.ParseReplay> {
    @Field(() => String)
    taskId: string;

    @Field(() => ProgressStatus)
    status: ProgressStatus;

    @Field(() => Progress)
    progress: IProgress;

    @Field(() => ParseReplayResult, {nullable: true})
    result: ParseReplayResult | null;

    @Field(() => String, {nullable: true})
    error: string | null;
}

export type ParseReplaysTasks = Record<string, {
    status: ProgressStatus;
    result: TaskResult<Task.ParseReplay> | null;
    error: Error | null;
}>;
