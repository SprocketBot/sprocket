import type {DataSource, DeepPartial, FindOneOptions, SelectQueryBuilder} from "typeorm";
import {Repository} from "typeorm";

import type {BaseEntity} from "../base-entity";
import type {Class} from "./repository.types";

export abstract class ExtendedRepository<T extends BaseEntity> extends Repository<T> {
    constructor(readonly c: Class<T>, readonly dataSource: DataSource) {
        super(c, dataSource.createEntityManager());
    }

    async findById(id: number, options?: FindOneOptions<T>): Promise<T> {
        return this.findOneOrFail(
            Object.assign(
                {
                    where: {id},
                },
                options,
            ),
        );
    }

    async createAndSave(data: DeepPartial<T>): Promise<T> {
        const newEntity = this.create(data);
        await this.save(newEntity);

        return newEntity;
    }

    async updateAndSave(id: number, data: DeepPartial<T>): Promise<T> {
        let entity = await this.findOneOrFail({where: {id}} as FindOneOptions<T>);
        entity = this.merge(entity, data);
        await this.save(entity);

        return entity;
    }

    async findAndDelete(id: number): Promise<T> {
        const entity = await this.findOneOrFail({where: {id}} as FindOneOptions<T>);
        await this.delete(id);

        return entity;
    }

    similarityBuilder(query: string, field: keyof T, threshold = 0.5, limit = 10): SelectQueryBuilder<T> {
        return this.createQueryBuilder(this.c.name)
            .addSelect(`SIMILARITY(${String(field)}, :query)`, "similarity")
            .where(`SIMILARITY(${String(field)}, :query) > :threshold`, {threshold})
            .setParameter("query", query)
            .orderBy("similarity", "DESC")
            .take(limit < 0 ? undefined : limit);
    }

    async getSimilar(query: string, field: keyof T, threshold?: number, limit?: number): Promise<T[]> {
        return this.similarityBuilder(query, field, threshold, limit).getMany();
    }
}
