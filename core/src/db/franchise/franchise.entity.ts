import { FranchiseObject } from '../../gql/franchise/franchise.object';
import { DataOnly } from '../../gql/types';
import { BaseEntity } from '../base.entity';
import { Entity } from 'typeorm';

@Entity('franchise', { schema: 'sprocket' })
export class FranchiseEntity extends BaseEntity<FranchiseObject> {
  toObject(): DataOnly<FranchiseObject> {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}