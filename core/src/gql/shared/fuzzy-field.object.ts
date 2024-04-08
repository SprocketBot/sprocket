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

export type Fuzzable<
  ObjectType,
  Keys extends keyof ObjectType,
  IsPartial extends boolean = true,
> = Omit<IsPartial extends true ? Partial<ObjectType> : ObjectType, Keys> & {
  [k in Keys]: ObjectType[k] extends string ? FuzzyString : never;
};

// function AddFuzzy<BaseClass, Field extends keyof BaseClass = keyof BaseClass>(
//   fieldName: Field,
// ) {
//   return class {
//     @Field({ name: fieldName.toString() })
//     [fieldName.toString()]: FuzzyField<BaseClass[Field]> | BaseClass[Field];
//   };
// }

// export function WithFuzzyField<BaseClass extends Object>(
//   ...fieldNames: [keyof BaseClass, ...(keyof BaseClass)[]]
// ) {
//   let output = AddFuzzy<BaseClass>(fieldNames[0]);
//   for (const field of fieldNames.slice(1)) {
//     output = AddFuzzy<BaseClass>(field);
//   }

//   return output;
// }
