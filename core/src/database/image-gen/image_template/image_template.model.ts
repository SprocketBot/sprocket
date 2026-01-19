import { Field, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { Column, Entity } from 'typeorm';

import { BaseModel } from '../../base-model';
import { ImageTemplateQuery } from './image_template_query';

@Entity({ schema: 'sprocket' })
@ObjectType()
export class ImageTemplate extends BaseModel {
  @Column({ type: 'jsonb' })
  @Field(() => GraphQLJSON)
  templateStructure: unknown;

  @Column()
  @Field()
  reportCode: string;

  @Column()
  @Field()
  displayName: string;

  @Column()
  @Field()
  description: string;

  @Column({ type: 'jsonb' })
  @Field(() => ImageTemplateQuery)
  query: ImageTemplateQuery;
}
