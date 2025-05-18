import { SkillGroupEntity } from '../../src/db/skill_group/skill_group.entity';
import { SkillGroupRepository } from '../../src/db/skill_group/skill_group.repository';

describe('SkillGroupEntity', () => {
  it('should be defined', () => {
    expect(SkillGroupEntity).toBeDefined();
  });
});

describe('SkillGroupRepository', () => {
  it('should be defined', () => {
    expect(SkillGroupRepository).toBeDefined();
  });
});
