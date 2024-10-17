import { Injectable } from '@nestjs/common';
import { BaseEntity } from '../../db/base.entity';
import { BaseObject } from '../base.object';
import { FindOptionsWhere, In } from 'typeorm';
import { BaseRepository } from '../../db/base.repository';
import { DataOnly } from '../types';
import { FuzzyString } from '../shared/fuzzy-field.object';

@Injectable()
export class ResolverLibService {
  async find<
    EntityType extends BaseEntity<ObjectType>,
    ObjectType extends BaseObject<EntityType> = BaseObject<EntityType>,
    Field extends keyof DataOnly<EntityType> = keyof DataOnly<EntityType>,
  >(
    repository: BaseRepository<EntityType, ObjectType>,
    field: Field,
    fuzzySpec: FuzzyString,
    initialFilter: FindOptionsWhere<EntityType> = {},
    pageSpec: { offset: number; limit: number } = { offset: 0, limit: 10 },
    threshold: number = 0,
  ): Promise<Array<DataOnly<ObjectType>>> {
    const filter: FindOptionsWhere<EntityType> = { ...initialFilter };
    // You can only use id to lookup a single item
    if (field === 'id') {
      const id = fuzzySpec.term;
      // We can safely assume that id is a string because all IDs are UUIDs in this project
      if (typeof id !== 'string') return [];
      const self = await repository.findOneByOrFail({
        ...filter, // apply any filtering up to this point
        id: id as any, // I don't know why Typescript vomits here
      });
      return [self.toObject()];
    }
    if (!fuzzySpec.allowEmpty && !fuzzySpec.fuzzy) {
      // non-fuzzy, without allowing empty means that we can't find anything
      filter[field.toString()] = fuzzySpec.term;
    }

    return await repository
      .search(fuzzySpec.term, field, pageSpec.limit, threshold, filter)
      .then((searchResults) => {
        const output = repository
          .findBy({
            id: In(searchResults.map((r) => r.id)) as any, // I don't know why Typescript vomits here
          })
          .then((results) => results.map((r) => r.toObject()));
        return output;
      });
  }

  async simpleLookup<
    EntityType extends BaseEntity<ObjectType>,
    ObjectType extends BaseObject<EntityType> = BaseObject<EntityType>,
    Field extends keyof ObjectType & keyof EntityType = keyof ObjectType &
      keyof EntityType,
  >(
    repository: BaseRepository<EntityType, ObjectType>,
    field: Field,
    root: ObjectType,
  ): Promise<ObjectType[Field]> {
    if (root[field]) return root[field];
    return repository
      .findOneOrFail({
        where: { id: root.id } as FindOptionsWhere<EntityType>,
        select: [field],
      })
      .then((r) => r[field])
      .then((r) => {
        if (Array.isArray(r)) return r.map((v) => v.toObject());
        if (typeof r !== 'object') return r;
        if ('toObject' in r && typeof r.toObject === 'function')
          return r.toObject();
        return r;
      });
  }
}
