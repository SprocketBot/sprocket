import { Field, ObjectType } from '@nestjs/graphql';
import { Entity, ManyToOne } from 'typeorm';

import { GameFeature } from '$db/game/game_feature/game_feature.model';

import { BaseModel } from '../../base-model';
import { Organization } from '../../organization/organization/organization.model';

@Entity({ schema: 'sprocket' })
@ObjectType()
export class EnabledFeature extends BaseModel {
  @ManyToOne(() => GameFeature)
  @Field(() => GameFeature)
  feature: GameFeature;

  @ManyToOne(() => Organization)
  @Field(() => Organization)
  organization: Organization;
}
