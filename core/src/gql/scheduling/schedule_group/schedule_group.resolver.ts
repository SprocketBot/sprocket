import { Args, ResolveField, Resolver, Root, Query } from '@nestjs/graphql';
import { ScheduleGroupRepository } from '../../../db/schedule_group/schedule_group.repository';
import { DataOnly } from '../../types';
import { ResolverLibService } from '../../resolver-lib/resolver-lib.service';
import { ScheduleGroupEntity } from '../../../db/schedule_group/schedule_group.entity';
import { ScheduleGroupTypeObject } from '../schedule_group_type/schedule_group_type.object';
import {
  FindScheduleGroupsInput,
  ScheduleGroupObject,
} from './schedule_group.object';
import { FindOptionsWhere, LessThan, MoreThan } from 'typeorm';

@Resolver(() => ScheduleGroupObject)
export class ScheduleGroupResolver {
  constructor(
    private readonly scheduleGroupRepo: ScheduleGroupRepository,
    private readonly resolverLib: ResolverLibService,
  ) {}

  @Query(() => ScheduleGroupObject)
  async scheduleGroup(
    @Args('id') id: string,
  ): Promise<DataOnly<ScheduleGroupObject>> {
    return this.scheduleGroupRepo.findOneByOrFail({ id });
  }

  @Query(() => [ScheduleGroupObject])
  async scheduleGroups(
    @Args('query', { nullable: true }) query?: FindScheduleGroupsInput,
  ) {
    const filter: FindOptionsWhere<ScheduleGroupEntity> = {};
    if (!query) query = {};
    if ('startAfter' in query) filter.start = MoreThan(query.startAfter);

    if ('endBefore' in query) filter.end = LessThan(query.endBefore);

    return this.resolverLib.find(
      this.scheduleGroupRepo,
      'name',
      query?.name ?? { term: '', fuzzy: false, allowEmpty: true },
      filter,
    );
  }

  @ResolveField(() => ScheduleGroupTypeObject)
  async type(
    @Root() root: ScheduleGroupObject,
  ): Promise<DataOnly<ScheduleGroupTypeObject>> {
    return this.resolverLib.simpleLookup<
      ScheduleGroupEntity,
      ScheduleGroupObject,
      'type'
    >(this.scheduleGroupRepo, 'type', root);
  }

  @ResolveField(() => [ScheduleGroupObject], { nullable: true })
  async children(
    @Root() root: ScheduleGroupObject,
  ): Promise<DataOnly<ScheduleGroupObject>[]> {
    return this.resolverLib.simpleLookup<
      ScheduleGroupEntity,
      ScheduleGroupObject,
      'children'
    >(this.scheduleGroupRepo, 'children', root);
  }
  @ResolveField(() => [ScheduleGroupObject], { nullable: true })
  async parent(
    @Root() root: ScheduleGroupObject,
  ): Promise<DataOnly<ScheduleGroupObject>> {
    return this.resolverLib.simpleLookup<
      ScheduleGroupEntity,
      ScheduleGroupObject,
      'parent'
    >(this.scheduleGroupRepo, 'parent', root);
  }
}
