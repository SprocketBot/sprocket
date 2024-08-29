import { ObjectType } from '@nestjs/graphql';
import { BaseObject } from '../base.object';
import type { FranchiseEntity } from '../../db/franchise/franchise.entity';

@ObjectType('Franchise')
export class FranchiseObject extends BaseObject<FranchiseEntity> {
  toEntity(): FranchiseEntity {
    throw new Error();
  }
}
