import {
    createUnionType, Field, ObjectType,
} from "@nestjs/graphql";

@ObjectType()
export class FranchiseInfo {
    @Field(() => Number)
  id: number;

    @Field(() => String)
  name: string;
}

@ObjectType()
export class FranchiseValidationResult {
    @Field(() => Boolean)
  eligible: boolean;

    @Field(() => FranchiseInfo, {nullable: true})
  eligibleFranchise?: FranchiseInfo;

    @Field(() => [FranchiseInfo])
  existingFranchises: FranchiseInfo[];

    @Field(() => Number)
  requiredFranchises: number;

    @Field(() => Number)
  currentFranchiseCount: number;

    @Field(() => Boolean)
  canRatify: boolean;

    @Field(() => String, {nullable: true})
  reason?: string;
}

@ObjectType()
export class ValidationSuccess {
    @Field(() => Boolean)
  valid: true;

    @Field(() => FranchiseValidationResult, {nullable: true})
  franchiseValidation?: FranchiseValidationResult;
}

@ObjectType()
export class ValidationError {
    @Field(() => String)
  error: string;

    @Field(() => Number, {nullable: true})
  gameIndex?: number;

    @Field(() => Number, {nullable: true})
  teamIndex?: number;

    @Field(() => Number, {nullable: true})
  playerIndex?: number;
}

@ObjectType()
export class ValidationFailure {
    @Field(() => Boolean)
  valid: false;

    @Field(() => [ValidationError])
  errors: ValidationError[];

    @Field(() => FranchiseValidationResult, {nullable: true})
  franchiseValidation?: FranchiseValidationResult;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

export const ValidationResultUnion = createUnionType({
    name: "ValidationResult",
    types: () => [ValidationSuccess, ValidationFailure],
    resolveType: value => (value.valid ? ValidationSuccess : ValidationFailure),
});
