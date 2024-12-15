import { BaseEntity } from '../base.entity';
import { UserEntity } from '../user/user.entity';
import { ManyToOne } from 'typeorm';
import { Entity } from 'typeorm';

@Entity('round', { schema: 'sprocket' })
export class RoleEntity extends BaseEntity {
  name: string;

  @ManyToOne(() => UserEntity)
  user: Promise<UserEntity>;
}
