import { User } from '@sprocketbot/lib/types';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity('user')
export class UserEntity
  extends BaseEntity
  implements Omit<User, 'allowedActions'>
{
  @Column()
  username: string;

  @Column()
  avatarUrl: string;
}
