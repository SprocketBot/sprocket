import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';

import { UserAuthenticationAccount } from '$db/identity/user_authentication_account/user_authentication_account.model';
import { UserProfile } from '$db/identity/user_profile/user_profile.model';

import { BaseModel } from '../../base-model';
import { Member } from '../../organization/member/member.model';
import type { UserRolesType } from '../roles/user_roles_type.enum';

@Entity({ schema: 'sprocket' })
@ObjectType()
export class User extends BaseModel {
  @OneToMany(() => UserAuthenticationAccount, uaa => uaa.user)
  @Field(() => [UserAuthenticationAccount])
  authenticationAccounts: UserAuthenticationAccount[];

  @OneToOne(() => UserProfile, profile => profile.user)
  @Field(() => UserProfile)
  profile: UserProfile;

  @Column({
    name: 'type',
    type: 'text',
    array: true,
    nullable: true,
    transformer: {
      to: (value: UserRolesType[] | null | undefined): string[] | null => {
        if (!value || value.length === 0) return null;
        return value;
      },
      from: (value: string[] | null): UserRolesType[] => {
        if (!value) return [];
        return value as UserRolesType[];
      },
    },
  })
  type: UserRolesType[];

  @OneToMany(() => Member, m => m.user)
  @Field(() => [Member])
  members: Member[];
}
