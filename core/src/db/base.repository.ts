import { Repository, type FindOptionsWhere } from 'typeorm';
import { BaseObject } from '../gql/base.object';
import { BaseEntity } from './base.entity';
import { DataOnly } from '../gql/types';

export abstract class BaseRepository<
  EntityType extends BaseEntity<ObjectType>,
  ObjectType extends BaseObject<EntityType> = BaseObject<EntityType>,
> extends Repository<EntityType> {
  async search(
    term: string,
    field: keyof DataOnly<EntityType>,
    limit: number = 10,
    threshold: number = 0,
    filterOpts: FindOptionsWhere<EntityType> = {},
  ): Promise<EntityType[]> {
    const qb = this.createQueryBuilder();
    const result = await qb
      .select('*')
      .addSelect(
        `similarity(${field.toString()}::text, '${term.toString()}'::text)`,
      )
      .orderBy(
        `similarity(${field.toString()}::text, '${term.toString()}'::text)`,
        'DESC',
      )
      .limit(limit);

    if (threshold) {
      result.where(
        `similarity(${field.toString()}::text, '${term.toString()}'::text) >= ${threshold}`,
      );
    }

    result.where(filterOpts);
    return await result.execute();
  }
}
