import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('SkillGroup')
export class SkillGroupObject {
  @Field()
  id: string;

  @Field()
  name: string;
  @Field()
  code: string;
}
