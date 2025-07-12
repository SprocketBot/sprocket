import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SkillGroupEntity } from '../internal';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SkillGroupRepository extends Repository<SkillGroupEntity> {
	constructor(
		@InjectRepository(SkillGroupEntity)
		baseRepository: Repository<SkillGroupEntity>
	) {
		super(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
	}
}
