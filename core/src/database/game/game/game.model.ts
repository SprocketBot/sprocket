import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';

import { GameFeature } from '$db/game/game_feature/game_feature.model';
import { GameMode } from '$db/game/game_mode/game_mode.model';
import { Platform } from '$db/game/platform/platform.model';

import { BaseModel } from '../../base-model';
import { GameSkillGroup } from '../../franchise/game_skill_group/game_skill_group.model';

@Entity({ schema: 'sprocket' })
@ObjectType()
export class Game extends BaseModel {
  @Column()
  @Field(() => String)
  title: string;

  @OneToMany(() => GameMode, gm => gm.game)
  @Field(() => [GameMode])
  modes: GameMode[];

  @OneToMany(() => GameSkillGroup, gsg => gsg.game)
  @Field(() => [GameSkillGroup])
  skillGroups: GameSkillGroup[];

  @ManyToMany(() => Platform)
  @JoinTable({ name: 'game_platform' })
  @Field(() => [Platform])
  supportedPlatforms: Platform[];

  @OneToMany(() => GameFeature, gf => gf.game)
  @Field(() => [GameFeature])
  supportedFeatures: GameFeature[];
}
