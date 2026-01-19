import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ClubEntity } from './club.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { OffsetPagination } from '../../gql/shared/pagination.object';
import { ClubFilters, ClubSort } from '../../gql/club/club.object';

@Injectable()
export class ClubRepository extends Repository<ClubEntity> {
	constructor(
		@InjectRepository(ClubEntity)
		baseRepository: Repository<ClubEntity>
	) {
		super(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
	}

	async findAndCountPaginated(
		pagination: OffsetPagination,
		filter?: ClubFilters,
		sort?: ClubSort,
	): Promise<[ClubEntity[], number]> {
		const qb = this.createQueryBuilder('club');

		if (filter) {
			if (filter.id) {
				qb.andWhere('club.id = :id', { id: filter.id });
			}
			if (filter.isActive !== undefined) {
				qb.andWhere('club.isActive = :isActive', { isActive: filter.isActive });
			}
			if (filter.slug) {
				qb.andWhere('club.slug = :slug', { slug: filter.slug });
			}
			if (filter.franchiseId) {
				qb.andWhere('club.franchiseId = :franchiseId', { franchiseId: filter.franchiseId });
			}
			if (filter.gameId) {
				qb.andWhere('club.gameId = :gameId', { gameId: filter.gameId });
			}
			if (filter.name) {
				if (filter.name.fuzzy && filter.name.term) {
					qb.andWhere('similarity(club.name, :term) > 0.3', { term: filter.name.term });
					qb.addOrderBy('similarity(club.name, :term)', 'DESC');
				} else if (filter.name.term) {
					qb.andWhere('club.name ILIKE :term', { term: `%${filter.name.term}%` });
				}
			}
		}

		if (sort) {
			Object.entries(sort).forEach(([key, value]) => {
				if (value) {
					qb.addOrderBy(`club.${key}`, value);
				}
			});
		}

		qb.skip(pagination.offset);
		qb.take(pagination.limit);

		return qb.getManyAndCount();
	}
}
