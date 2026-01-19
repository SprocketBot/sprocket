import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import type { ProgressMessage, Task } from '@sprocketbot/common';
import { Parser, ProgressStatus } from '@sprocketbot/common';

import { GqlProgress } from '../../util/types/celery-progress';

registerEnumType(Parser, { name: 'Parser' });

@ObjectType()
export class SubmissionProgressMessage implements ProgressMessage<Task.ParseReplay> {
  @Field(() => String, { nullable: true })
  error: string | null;

  @Field(() => GqlProgress)
  progress: GqlProgress;

  @Field(() => ProgressStatus)
  status: ProgressStatus;

  @Field(() => String)
  taskId: string;

  result: ProgressMessage<Task.ParseReplay>['result'];
}

@ObjectType()
export class ReplaySubmissionItem {
  @Field(() => String)
  taskId: string;

  @Field(() => String)
  originalFilename: string;

  @Field(() => SubmissionProgressMessage)
  progress?: SubmissionProgressMessage;

  inputPath: string;

  outputPath?: string;
}
