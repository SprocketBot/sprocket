import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { BaseObject } from '../gql/base.object';
import { DataOnly } from '../gql/types';

export abstract class BaseEntity<ObjectType extends BaseObject<any>>
  implements BaseEntity<ObjectType>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  abstract toObject(): DataOnly<ObjectType>;
}
