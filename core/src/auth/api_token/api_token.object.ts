import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ApiToken {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  tokenPrefix: string;

  @Field(() => [String])
  scopes: string[];

  @Field(() => Date, { nullable: true })
  expiresAt?: Date;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  lastUsedAt?: Date;

  @Field(() => Number)
  usageCount: number;

  @Field(() => Boolean)
  isRevoked: boolean;
}

@ObjectType()
export class ApiTokenAndSecret extends ApiToken {
    @Field(() => String, { description: 'The full secret token. Only validation once upon creation.' })
    secret: string;
}
