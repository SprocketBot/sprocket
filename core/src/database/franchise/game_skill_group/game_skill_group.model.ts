import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';

import { GameSkillGroupProfile } from '$db/franchise/game_skill_group_profile/game_skill_group_profile.model';
import { Player } from '$db/franchise/player/player.model';
import { RosterRoleUseLimits } from '$db/franchise/roster_role_use_limits/roster_role_use_limits.model';
import { Team } from '$db/franchise/team/team.model';

import { BaseModel } from '../../base-model';
import { Game } from '../../game/game/game.model';
import { Organization } from '../../organization/organization/organization.model';

@Entity({ schema: 'sprocket' })
@ObjectType()
export class GameSkillGroup extends BaseModel {
  @Column()
  @Field(() => Number)
  ordinal: number;

  @Column()
  @Field(() => Number)
  salaryCap: number;

  @OneToOne(() => GameSkillGroupProfile, gsgp => gsgp.skillGroup)
  @Field(() => GameSkillGroupProfile)
  profile: GameSkillGroupProfile;

  @ManyToOne(() => Game, g => g.skillGroups)
  @JoinColumn()
  @Field(() => Game)
  game: Game;

  @OneToOne(() => RosterRoleUseLimits)
  @JoinColumn()
  @Field(() => RosterRoleUseLimits)
  roleUseLimits: RosterRoleUseLimits;

  @OneToMany(() => Player, p => p.skillGroup)
  @Field(() => [Player])
  players: Player[];

  @OneToMany(() => Team, t => t.skillGroup)
  @Field(() => [Team])
  teams: Team[];

  @ManyToOne(() => Organization)
  @Field(() => Organization)
  organization: Organization;

  @Column()
  organizationId: number;
}
