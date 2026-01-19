import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity } from 'typeorm';

import { BaseModel } from '../../base-model';
import { UserRolesType } from './user_roles_type.enum';

@Entity({ schema: 'sprocket' })
@ObjectType()
export class UserRoles extends BaseModel {
  @Column({
    type: 'enum',
    enum: UserRolesType,
    enumName: 'user_roles_accounttype_enum',
  })
  @Field(() => UserRolesType)
  accountType: UserRolesType;
}
