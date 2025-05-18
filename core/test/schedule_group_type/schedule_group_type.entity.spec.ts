import { ScheduleGroupTypeEntity } from '../../src/db/schedule_group_type/schedule_group_type.entity';
import { ScheduleGroupTypeRepository } from '../../src/db/schedule_group_type/schedule_group_type.repository';

describe('ScheduleGroupTypeEntity', () => {
  it('should be defined', () => {
    expect(ScheduleGroupTypeEntity).toBeDefined();
  });
});

describe('ScheduleGroupTypeRepository', () => {
  it('should be defined', () => {
    expect(ScheduleGroupTypeRepository).toBeDefined();
  });
});
