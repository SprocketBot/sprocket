import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('SubmissionValidationError')
export class SubmissionValidationErrorObject {
  @Field(() => String)
  error: string;

  @Field(() => String, { nullable: true })
  code?: string;
}

@ObjectType('SubmissionValidationResult')
export class SubmissionValidationResultObject {
  @Field(() => Boolean)
  valid: boolean;

  @Field(() => [SubmissionValidationErrorObject])
  errors: SubmissionValidationErrorObject[];
}
