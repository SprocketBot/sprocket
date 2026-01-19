import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity } from 'typeorm';

import { BaseModel } from '../../base-model';

@Entity({ schema: 'sprocket' })
@ObjectType()
export class VerbiageCode extends BaseModel {
  @Column()
  @Field(() => String)
  code: string;

  @Column()
  @Field(() => String)
  default: string;
}
