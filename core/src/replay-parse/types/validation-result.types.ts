import { createUnionType, Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ValidationSuccess {
  @Field(() => Boolean)
  valid: true;
}

@ObjectType()
export class ValidationError {
  @Field(() => String)
  error: string;

  @Field(() => Number, { nullable: true })
  gameIndex?: number;

  @Field(() => Number, { nullable: true })
  teamIndex?: number;

  @Field(() => Number, { nullable: true })
  playerIndex?: number;
}

@ObjectType()
export class ValidationFailure {
  @Field(() => Boolean)
  valid: false;

  @Field(() => [ValidationError])
  errors: ValidationError[];
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

export const ValidationResultUnion = createUnionType({
  name: 'ValidationResult',
  types: () => [ValidationSuccess, ValidationFailure],
  resolveType: value => (value.valid ? ValidationSuccess : ValidationFailure),
});
