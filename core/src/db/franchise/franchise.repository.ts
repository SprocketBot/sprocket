import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { FranchiseEntity } from './franchise.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { OffsetPagination } from '../../gql/shared/pagination.object';
import { FranchiseFilters, FranchiseSort } from '../../gql/franchise/franchise.object';

@Injectable()
export class FranchiseRepository extends Repository<FranchiseEntity> {
	constructor(
		@InjectRepository(FranchiseEntity)
		baseRepository: Repository<FranchiseEntity>
	) {
		super(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
	}

	async findAndCountPaginated(
		pagination: OffsetPagination,
		filter?: FranchiseFilters,
		sort?: FranchiseSort,
	): Promise<[FranchiseEntity[], number]> {
		const qb = this.createQueryBuilder('franchise');

		if (filter) {
			if (filter.id) {
				qb.andWhere('franchise.id = :id', { id: filter.id });
			}
			if (filter.isActive !== undefined) {
				qb.andWhere('franchise.isActive = :isActive', { isActive: filter.isActive });
			}
			if (filter.slug) {
				qb.andWhere('franchise.slug = :slug', { slug: filter.slug });
			}
			if (filter.name) {
				if (filter.name.fuzzy && filter.name.term) {
					qb.andWhere('similarity(franchise.name, :term) > 0.3', { term: filter.name.term });
					qb.addOrderBy('similarity(franchise.name, :term)', 'DESC');
				} else if (filter.name.term) {
					qb.andWhere('franchise.name ILIKE :term', { term: `%${filter.name.term}%` });
				}
			}
		}

		if (sort) {
			Object.entries(sort).forEach(([key, value]) => {
				if (value) {
					qb.addOrderBy(`franchise.${key}`, value);
				}
			});
		}

		qb.skip(pagination.offset);
		qb.take(pagination.limit);

		return qb.getManyAndCount();
	}
}
