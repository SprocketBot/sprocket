import { BaseEntity } from '../base.entity';
import { Entity } from 'typeorm';

@Entity('skill_group', { schema: 'sprocket' })
export class SkillGroupEntity extends BaseEntity {}
