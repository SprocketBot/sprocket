import {Injectable} from "@nestjs/common";
import {GraphQLError} from "graphql";
import {DataSource} from "typeorm";

import type {BaseModel} from "../../database/base-model";

type Class<T> = new (...args: unknown[]) => T;

@Injectable()
export class PopulateService {
    constructor(private readonly dataSource: DataSource) {}

    async populateOneOrFail<Entity extends BaseModel, RelationPath extends keyof Entity & string>(
        base: Class<Entity>,
        root: Entity,
        relation: RelationPath,
    ): Promise<Entity[RelationPath]> {
        const result: Entity[RelationPath] | undefined = await this.dataSource
            .createQueryBuilder()
            .relation(base, relation)
            .of(root)
            .loadOne();
        if (!result) throw new GraphQLError(`Unable to find ${relation} for ${base.name} (id = ${root.id})`);
        return result;
    }

    async populateOne<Entity extends BaseModel, RelationPath extends keyof Entity & string>(
        base: Class<Entity>,
        root: Entity,
        relation: RelationPath,
    ): Promise<Entity[RelationPath] | undefined> {
        const result: Entity[RelationPath] | undefined = await this.dataSource
            .createQueryBuilder()
            .relation(base, relation)
            .of(root)
            .loadOne();
        return result;
    }

    async populateMany<Entity extends BaseModel, RelationPath extends keyof Entity & string>(
        base: Class<Entity>,
        root: Entity,
        relation: RelationPath,
    ): Promise<Entity[RelationPath]> {
        const result: Entity[RelationPath] = (await this.dataSource
            .createQueryBuilder()
            .relation(base, relation)
            .of(root)
            .loadMany()) as unknown as Entity[RelationPath];
        return result;
    }
}
