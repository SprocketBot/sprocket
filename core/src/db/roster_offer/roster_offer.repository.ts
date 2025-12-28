import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RosterOfferEntity } from './roster_offer.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RosterOfferRepository extends Repository<RosterOfferEntity> {
	constructor(
		@InjectRepository(RosterOfferEntity)
		baseRepository: Repository<RosterOfferEntity>
	) {
		super(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
	}
}
