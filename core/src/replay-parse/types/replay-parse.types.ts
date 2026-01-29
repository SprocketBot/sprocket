import { Field, ObjectType } from '@nestjs/graphql';
import {
  BallchasingResponse,
  CarballResponse,
  Parser,
  Progress as IProgress,
  ProgressStatus,
} from '@sprocketbot/common';
import GraphQLJSON from 'graphql-type-json';

import { GqlProgress } from '../../util/types/celery-progress';

@ObjectType()
export class ParseReplayResult {
  @Field(() => Parser)
  parser: Parser;

  @Field()
  parserVersion: number;

  @Field()
  outputPath: string;

  @Field(() => GraphQLJSON)
  data: BallchasingResponse | CarballResponse;
}

@ObjectType()
export class ReplayParseProgress {
  @Field(() => String)
  taskId: string;

  @Field(() => ProgressStatus)
  status: ProgressStatus;

  @Field(() => GqlProgress)
  progress: IProgress;

  @Field(() => ParseReplayResult, { nullable: true })
  result: ParseReplayResult | null;

  @Field(() => String)
  filename: string;

  @Field(() => String, { nullable: true })
  error: string | null;
}

export type ParseReplaysTasks = Record<
  string,
  {
    status: ProgressStatus;
    result: ParseReplayResult | null;
    error: Error | null;
  }
>;
