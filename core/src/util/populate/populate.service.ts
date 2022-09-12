import {Injectable} from "@nestjs/common";
import {InjectConnection} from "@nestjs/typeorm/dist/common/typeorm.decorators";
import {Cache, CacheKey} from "@sprocketbot/common/lib/util/caching";
import {GraphQLError} from "graphql";
import {Connection} from "typeorm";

import type {BaseModel} from "../../database/base-model";

type Class<T> = new (...args: unknown[]) => T;

@Injectable()
export class PopulateService {
    constructor(@InjectConnection()
              private readonly repo: Connection) {
    }

    @Cache({
        ttl: 500,
        transformers: {
            root: (root: BaseModel): string => root.id.toString(),
            base: (base: Class<unknown>): string => base.name,
        },
    })
    async populateOneOrFail<Entity extends BaseModel, RelationPath extends keyof Entity & string>(
        base: Class<Entity>,
      @CacheKey
      root: Entity,
      @CacheKey
      relation: RelationPath,
    ): Promise<Entity[RelationPath]> {
        const result: Entity[RelationPath] | undefined = await this.repo.createQueryBuilder()
            .relation(base, relation)
            .of(root)
            .loadOne();
        if (!result) throw new GraphQLError(`Unable to find ${relation} for ${base.name} (id = ${root.id})`);
        return result;
    }

    @Cache({
        ttl: 500,
        transformers: {
            root: (root: BaseModel): string => root.id.toString(),
            base: (base: Class<unknown>): string => base.name,
        },
    })
    async populateOne<Entity extends BaseModel, RelationPath extends keyof Entity & string>(
        base: Class<Entity>,
        @CacheKey
        root: Entity,
        @CacheKey
        relation: RelationPath,
    ): Promise<Entity[RelationPath] | undefined> {
        const result: Entity[RelationPath] | undefined = await this.repo.createQueryBuilder()
            .relation(base, relation)
            .of(root)
            .loadOne();
        return result;
    }

    @Cache({
        ttl: 500,
        transformers: {
            root: (root: BaseModel): string => root.id.toString(),
            base: (base: Class<unknown>): string => base.name,
        },
    })
    async populateMany<Entity extends BaseModel, RelationPath extends keyof Entity & string>(
        @CacheKey
        base: Class<Entity>,
        @CacheKey
        root: Entity,
        @CacheKey
        relation: RelationPath,
    ): Promise<Entity[RelationPath]> {
        const result: Entity[RelationPath] = await this.repo.createQueryBuilder()
            .relation(base, relation)
            .of(root)
            .loadMany() as unknown as Entity[RelationPath];
        return result;
    }

}
