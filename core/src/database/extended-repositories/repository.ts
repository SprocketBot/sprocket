import type {DataSource, DeepPartial, FindManyOptions, FindOneOptions, SelectQueryBuilder} from "typeorm";
import {Repository} from "typeorm";

import type {BaseModel} from "../base-model";
import type {Class} from "./repository.types";

export abstract class ExtendedRepository<T extends BaseModel> extends Repository<T> {
    constructor(readonly c: Class<T>, readonly dataSource: DataSource) {
        super(c, dataSource.createEntityManager());
    }

    async get(options: FindOneOptions<T>): Promise<T> {
        return this.findOneOrFail(options);
    }

    async getOrNull(options: FindOneOptions<T>): Promise<T | null> {
        return this.findOne(options);
    }

    async getById(id: number, options?: FindOneOptions<T>): Promise<T> {
        return this.findOneOrFail(
            Object.assign(
                {
                    where: {id},
                },
                options,
            ),
        );
    }

    async getMany(options?: FindManyOptions<T>): Promise<T[]> {
        return this.find(options);
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

    async deleteAndReturn(id: number): Promise<T> {
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