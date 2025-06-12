import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserAuthAccountEntity } from '../internal';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserAuthAccountRepository extends Repository<UserAuthAccountEntity> {
	constructor(
		@InjectRepository(UserAuthAccountEntity)
		baseRepository: Repository<UserAuthAccountEntity>
	) {
		super(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
	}
}
