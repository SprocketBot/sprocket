import { Injectable } from '@nestjs/common';
import { SeasonRepository } from '../../db/season/season.repository';
import { SeasonEntity } from '../../db/season/season.entity';

@Injectable()
export class SeasonService {
	constructor(private readonly seasonRepo: SeasonRepository) {}

	async getSeasonById(id: string): Promise<SeasonEntity> {
		return this.seasonRepo.findOneOrFail({ where: { id } });
	}

	async getAllSeasons(): Promise<SeasonEntity[]> {
		return this.seasonRepo.find();
	}
}
