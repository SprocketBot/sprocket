import { Field, ObjectType } from '@nestjs/graphql';
import type { SkillGroupEntity } from '../../db/skill_group/skill_group.entity';
import { BaseObject } from '../base.object';

@ObjectType('SkillGroup')
export class SkillGroupObject extends BaseObject<SkillGroupEntity> {
  @Field()
  id: string;

  @Field()
  name: string;
  @Field()
  code: string;

  toEntity(): SkillGroupEntity {
    throw new Error();
  }
}
