import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity } from 'typeorm';

import { BaseModel } from '../../base-model';

@Entity({ schema: 'sprocket' })
@ObjectType()
export class Invalidation extends BaseModel {
  @Column()
  @Field(() => String)
  description: string;

  @Column()
  @Field(() => Boolean)
  favorsHomeTeam: boolean;
}
