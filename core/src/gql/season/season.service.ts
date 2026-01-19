import { Injectable, NotFoundException } from '@nestjs/common';
import { SeasonRepository } from '../../db/season/season.repository';
import { SeasonEntity } from '../../db/season/season.entity';
import { DataAuditAction } from '../../db/internal';
import { AuditService } from '../../audit/audit.service';
import { CreateSeasonInput, SeasonFilters, SeasonSort, UpdateSeasonInput } from './season.object';
import { OffsetPagination } from '../shared/pagination.object';

@Injectable()
export class SeasonService {
	constructor(
		private readonly seasonRepo: SeasonRepository,
		private readonly auditService: AuditService,
	) { }

	async getSeasonById(id: string): Promise<SeasonEntity> {
		const season = await this.seasonRepo.findOneBy({ id });
		if (!season) throw new NotFoundException(`Season with ID ${id} not found`);
		return season;
	}

	async getAllSeasons(): Promise<SeasonEntity[]> {
		return this.seasonRepo.find();
	}

	async getSeasonsPaginated(
		pagination: OffsetPagination,
		filter?: SeasonFilters,
		sort?: SeasonSort,
	): Promise<[SeasonEntity[], number]> {
		return this.seasonRepo.findAndCountPaginated(pagination, filter, sort);
	}

	async createSeason(data: CreateSeasonInput): Promise<SeasonEntity> {
		const season = this.seasonRepo.create(data);
		const saved = await this.seasonRepo.save(season);
		await this.auditService.log('Season', saved.id, DataAuditAction.CREATE, {
			newData: saved,
		});
		return saved;
	}

	async updateSeason(id: string, data: UpdateSeasonInput): Promise<SeasonEntity> {
		const season = await this.getSeasonById(id);
		const previousData = { ...season };
		Object.assign(season, data);
		const saved = await this.seasonRepo.save(season);
		await this.auditService.log('Season', saved.id, DataAuditAction.UPDATE, {
			previousData,
			newData: saved,
		});
		return saved;
	}

	async deleteSeason(id: string): Promise<SeasonEntity> {
		const season = await this.getSeasonById(id);
		const result = await this.seasonRepo.softRemove(season);
		await this.auditService.log('Season', id, DataAuditAction.DELETE, {
			previousData: season,
		});
		return result;
	}
}
