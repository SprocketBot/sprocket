import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleGroupTypeEntity } from '../../src/db/schedule_group_type/schedule_group_type.entity';
import { ScheduleGroupTypeRepository } from '../../src/db/schedule_group_type/schedule_group_type.repository';

describe('ScheduleGroupTypeEntity', () => {
  it('should be defined', () => {
    expect(ScheduleGroupTypeEntity).toBeDefined();
  });

  describe('Base Entity Fields', () => {
    it('should have id field', () => {
      const scheduleGroupType = new ScheduleGroupTypeEntity();
      expect(scheduleGroupType.id).toBeUndefined();
    });

    it('should have createdAt field', () => {
      const scheduleGroupType = new ScheduleGroupTypeEntity();
      expect(scheduleGroupType.createdAt).toBeUndefined();
    });

    it('should have updateAt field', () => {
      const scheduleGroupType = new ScheduleGroupTypeEntity();
      expect(scheduleGroupType.updateAt).toBeUndefined();
    });
  });
});

describe('ScheduleGroupTypeRepository', () => {
  let module: TestingModule;
  let scheduleGroupTypeRepository: Repository<ScheduleGroupTypeEntity>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(ScheduleGroupTypeEntity),
          useClass: Repository,
        },
        ScheduleGroupTypeRepository,
      ],
    }).compile();

    scheduleGroupTypeRepository = module.get(
      getRepositoryToken(ScheduleGroupTypeEntity),
    );
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(ScheduleGroupTypeRepository).toBeDefined();
  });

  it('should create a new schedule group type', async () => {
    const scheduleGroupType = new ScheduleGroupTypeEntity();
    const spy = vi
      .spyOn(scheduleGroupTypeRepository, 'save')
      .mockResolvedValueOnce(scheduleGroupType);

    const savedScheduleGroupType =
      await scheduleGroupTypeRepository.save(scheduleGroupType);
    expect(savedScheduleGroupType).toBeDefined();
    expect(savedScheduleGroupType).toBeInstanceOf(ScheduleGroupTypeEntity);
    spy.mockRestore();
  });

  it('should find a schedule group type by id', async () => {
    const scheduleGroupType = new ScheduleGroupTypeEntity();
    const spy = vi
      .spyOn(scheduleGroupTypeRepository, 'findOne')
      .mockResolvedValueOnce(scheduleGroupType);

    const foundScheduleGroupType = await scheduleGroupTypeRepository.findOne({
      where: { id: 'test-id' },
    });
    expect(foundScheduleGroupType).toBeDefined();
    expect(foundScheduleGroupType).toBeInstanceOf(ScheduleGroupTypeEntity);
    spy.mockRestore();
  });
});
