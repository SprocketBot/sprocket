import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TeamEntity } from './team.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { OffsetPagination } from '../../gql/shared/pagination.object';
import { TeamFilters, TeamSort } from '../../gql/team/team.object';

@Injectable()
export class TeamRepository extends Repository<TeamEntity> {
	constructor(
		@InjectRepository(TeamEntity)
		baseRepository: Repository<TeamEntity>
	) {
		super(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
	}

	async findAndCountPaginated(
		pagination: OffsetPagination,
		filter?: TeamFilters,
		sort?: TeamSort,
	): Promise<[TeamEntity[], number]> {
		const qb = this.createQueryBuilder('team');

		if (filter) {
			if (filter.id) {
				qb.andWhere('team.id = :id', { id: filter.id });
			}
			if (filter.isActive !== undefined) {
				qb.andWhere('team.isActive = :isActive', { isActive: filter.isActive });
			}
			if (filter.slug) {
				qb.andWhere('team.slug = :slug', { slug: filter.slug });
			}
			if (filter.clubId) {
				qb.andWhere('team.clubId = :clubId', { clubId: filter.clubId });
			}
			if (filter.skillGroupId) {
				qb.andWhere('team.skillGroupId = :skillGroupId', { skillGroupId: filter.skillGroupId });
			}
			if (filter.name) {
				if (filter.name.fuzzy && filter.name.term) {
					qb.andWhere('similarity(team.name, :term) > 0.3', { term: filter.name.term });
					qb.addOrderBy('similarity(team.name, :term)', 'DESC');
				} else if (filter.name.term) {
					qb.andWhere('team.name ILIKE :term', { term: `%${filter.name.term}%` });
				}
			}
		}

		if (sort) {
			Object.entries(sort).forEach(([key, value]) => {
				if (value) {
					qb.addOrderBy(`team.${key}`, value);
				}
			});
		}

		qb.skip(pagination.offset);
		qb.take(pagination.limit);

		return qb.getManyAndCount();
	}
}
