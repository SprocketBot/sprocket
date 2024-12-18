import { Field, ObjectType } from '@nestjs/graphql';
import type { BaseEntity } from '../db/base.entity';
import { BaseRepository } from '../db/base.repository';
import { FindOptionsWhere } from 'typeorm';

interface HasId {
  id: string;
}

@ObjectType({ isAbstract: true })
export abstract class BaseObject<EntityType extends BaseEntity<any> & HasId>
  implements BaseObject<EntityType>
{
  @Field()
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  protected repo?: BaseRepository<EntityType>;
  toEntity(): EntityType | Promise<EntityType> {
    if (!this.repo)
      throw new Error(`Cannot convert to Entity, repository not available`);
    return this.repo.findOneByOrFail({
      id: this.id,
    } as FindOptionsWhere<EntityType>);
  }
}
