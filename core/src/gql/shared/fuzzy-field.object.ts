import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class FuzzyString {
  @Field()
  term: string;

  @Field({ nullable: true, defaultValue: false })
  fuzzy: boolean;

  @Field({
    nullable: true,
    defaultValue: true,
    description: 'When set, an empty term returns unfiltered results',
  })
  allowEmpty: boolean;
}

