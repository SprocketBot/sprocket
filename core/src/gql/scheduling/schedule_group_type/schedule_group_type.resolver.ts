import { Args, Mutation, Query, ResolveField, Resolver, Root } from '@nestjs/graphql';
import { CreateScheduleGroupTypeInput, ScheduleGroupTypeObject } from './schedule_group_type.object';
import { ScheduleGroupTypeRepository } from '../../../db/schedule_group_type/schedule_group_type.repository';
import { ResolverLibService } from '../../resolver-lib/resolver-lib.service';
import { ScheduleGroupObject } from '../schedule_group/schedule_group.object';
import { ScheduleGroupTypeEntity } from '../../../db/schedule_group_type/schedule_group_type.entity';
import { DataOnly } from '../../types.js';
import { Logger } from '@nestjs/common';
@Resolver(() => ScheduleGroupTypeObject)
export class ScheduleGroupTypeResolver {
  logger = new Logger(ScheduleGroupTypeResolver.name);
  constructor(
    private readonly scheduleGroupTypeRepo: ScheduleGroupTypeRepository,
    private readonly resolverLib: ResolverLibService,
  ) {}

  @Query(() => ScheduleGroupTypeObject)
  async scheduleGroupType() {}

  @Query(() => [ScheduleGroupTypeObject])
  async scheduleGroupTypes() {
    return (await this.scheduleGroupTypeRepo.find()).map(v => v.toObject())
  }


  @Mutation(() => ScheduleGroupTypeObject)
  async createScheduleGroupType(@Args('data') data: CreateScheduleGroupTypeInput): Promise<DataOnly<ScheduleGroupTypeObject>> {
    const newType = this.scheduleGroupTypeRepo.create();
    newType.name = data.name;
    const newObject = await this.scheduleGroupTypeRepo.save(newType)
    this.logger.log(`Created new ScheduleGroupType`, { id: newObject.id, name: newObject.name })
    return newObject.toObject()
  }


  @ResolveField(() => [ScheduleGroupObject])
  async groups(
    @Root() type: ScheduleGroupTypeObject,
  ): Promise<ScheduleGroupObject[]> {
    return this.resolverLib.simpleLookup<
      ScheduleGroupTypeEntity,
      ScheduleGroupTypeObject,
      'groups'
    >(this.scheduleGroupTypeRepo, 'groups', type);
  }
}
