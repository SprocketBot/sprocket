import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SeasonEntity } from './season.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { OffsetPagination } from '../../gql/shared/pagination.object';
import { SeasonFilters, SeasonSort } from '../../gql/season/season.object';

@Injectable()
export class SeasonRepository extends Repository<SeasonEntity> {
	constructor(
		@InjectRepository(SeasonEntity)
		baseRepository: Repository<SeasonEntity>
	) {
		super(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
	}

	async findAndCountPaginated(
		pagination: OffsetPagination,
		filter?: SeasonFilters,
		sort?: SeasonSort,
	): Promise<[SeasonEntity[], number]> {
		const qb = this.createQueryBuilder('season');

		if (filter) {
			if (filter.id) {
				qb.andWhere('season.id = :id', { id: filter.id });
			}
			if (filter.isActive !== undefined) {
				qb.andWhere('season.isActive = :isActive', { isActive: filter.isActive });
			}
			if (filter.isOffseason !== undefined) {
				qb.andWhere('season.isOffseason = :isOffseason', { isOffseason: filter.isOffseason });
			}
			if (filter.status) {
				qb.andWhere('season.status = :status', { status: filter.status });
			}
			if (filter.slug) {
				qb.andWhere('season.slug = :slug', { slug: filter.slug });
			}
			if (filter.name) {
				if (filter.name.fuzzy && filter.name.term) {
					qb.andWhere('similarity(season.name, :term) > 0.3', { term: filter.name.term });
					qb.addOrderBy('similarity(season.name, :term)', 'DESC');
				} else if (filter.name.term) {
					qb.andWhere('season.name ILIKE :term', { term: `%${filter.name.term}%` });
				}
			}
		}

		if (sort) {
			Object.entries(sort).forEach(([key, value]) => {
				if (value) {
					qb.addOrderBy(`season.${key}`, value);
				}
			});
		}

		qb.skip(pagination.offset);
		qb.take(pagination.limit);

		return qb.getManyAndCount();
	}
}
