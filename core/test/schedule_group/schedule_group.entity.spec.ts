import { ScheduleGroupEntity } from '../../src/db/schedule_group/schedule_group.entity';
import { ScheduleGroupRepository } from '../../src/db/schedule_group/schedule_group.repository';

describe('ScheduleGroupEntity', () => {
  it('should be defined', () => {
    expect(ScheduleGroupEntity).toBeDefined();
  });
});

describe('ScheduleGroupRepository', () => {
  it('should be defined', () => {
    expect(ScheduleGroupRepository).toBeDefined();
  });
});
