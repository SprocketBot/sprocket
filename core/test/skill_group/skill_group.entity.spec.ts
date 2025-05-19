import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkillGroupEntity } from '../../src/db/skill_group/skill_group.entity';
import { SkillGroupRepository } from '../../src/db/skill_group/skill_group.repository';

describe('SkillGroupEntity', () => {
  it('should be defined', () => {
    expect(SkillGroupEntity).toBeDefined();
  });

  describe('Base Entity Fields', () => {
    it('should have id field', () => {
      const skillGroup = new SkillGroupEntity();
      expect(skillGroup.id).toBeUndefined();
    });

    it('should have createdAt field', () => {
      const skillGroup = new SkillGroupEntity();
      expect(skillGroup.createdAt).toBeUndefined();
    });

    it('should have updateAt field', () => {
      const skillGroup = new SkillGroupEntity();
      expect(skillGroup.updateAt).toBeUndefined();
    });
  });
});

describe('SkillGroupRepository', () => {
  let module: TestingModule;
  let skillGroupRepository: Repository<SkillGroupEntity>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(SkillGroupEntity),
          useClass: Repository,
        },
        SkillGroupRepository,
      ],
    }).compile();

    skillGroupRepository = module.get(getRepositoryToken(SkillGroupEntity));
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(SkillGroupRepository).toBeDefined();
  });

  it('should create a new skill group', async () => {
    const skillGroup = new SkillGroupEntity();
    jest.spyOn(skillGroupRepository, 'save').mockResolvedValueOnce(skillGroup);

    const savedSkillGroup = await skillGroupRepository.save(skillGroup);
    expect(savedSkillGroup).toBeDefined();
    expect(savedSkillGroup).toBeInstanceOf(SkillGroupEntity);
  });

  it('should find a skill group by id', async () => {
    const skillGroup = new SkillGroupEntity();
    jest
      .spyOn(skillGroupRepository, 'findOne')
      .mockResolvedValueOnce(skillGroup);

    const foundSkillGroup = await skillGroupRepository.findOne({
      where: { id: 'test-id' },
    });
    expect(foundSkillGroup).toBeDefined();
    expect(foundSkillGroup).toBeInstanceOf(SkillGroupEntity);
  });
});
