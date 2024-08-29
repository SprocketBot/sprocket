import { Field, ObjectType } from '@nestjs/graphql';
import type { BaseEntity } from '../db/base.entity';

@ObjectType({ isAbstract: true })
export abstract class BaseObject<EntityType extends BaseEntity<any>>
  implements BaseObject<EntityType>
{
  @Field()
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  abstract toEntity(): EntityType;
}
