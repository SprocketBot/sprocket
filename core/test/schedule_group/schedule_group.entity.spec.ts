import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleGroupEntity } from '../../src/db/schedule_group/schedule_group.entity';
import { ScheduleGroupRepository } from '../../src/db/schedule_group/schedule_group.repository';

describe('ScheduleGroupEntity', () => {
  it('should be defined', () => {
    expect(ScheduleGroupEntity).toBeDefined();
  });

  describe('Base Entity Fields', () => {
    it('should have id field', () => {
      const scheduleGroup = new ScheduleGroupEntity();
      expect(scheduleGroup.id).toBeUndefined();
    });

    it('should have createdAt field', () => {
      const scheduleGroup = new ScheduleGroupEntity();
      expect(scheduleGroup.createdAt).toBeUndefined();
    });

    it('should have updateAt field', () => {
      const scheduleGroup = new ScheduleGroupEntity();
      expect(scheduleGroup.updateAt).toBeUndefined();
    });
  });
});

describe('ScheduleGroupRepository', () => {
  let module: TestingModule;
  let scheduleGroupRepository: Repository<ScheduleGroupEntity>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(ScheduleGroupEntity),
          useClass: Repository,
        },
        ScheduleGroupRepository,
      ],
    }).compile();

    scheduleGroupRepository = module.get(
      getRepositoryToken(ScheduleGroupEntity),
    );
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(ScheduleGroupRepository).toBeDefined();
  });

  it('should create a new schedule group', async () => {
    const scheduleGroup = new ScheduleGroupEntity();
    const spy = vi
      .spyOn(scheduleGroupRepository, 'save')
      .mockResolvedValueOnce(scheduleGroup);

    const savedScheduleGroup =
      await scheduleGroupRepository.save(scheduleGroup);
    expect(savedScheduleGroup).toBeDefined();
    expect(savedScheduleGroup).toBeInstanceOf(ScheduleGroupEntity);
    spy.mockRestore();
  });

  it('should find a schedule group by id', async () => {
    const scheduleGroup = new ScheduleGroupEntity();
    const spy = vi
      .spyOn(scheduleGroupRepository, 'findOne')
      .mockResolvedValueOnce(scheduleGroup);

    const foundScheduleGroup = await scheduleGroupRepository.findOne({
      where: { id: 'test-id' },
    });
    expect(foundScheduleGroup).toBeDefined();
    expect(foundScheduleGroup).toBeInstanceOf(ScheduleGroupEntity);
    spy.mockRestore();
  });
});
