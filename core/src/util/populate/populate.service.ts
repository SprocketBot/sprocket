import {Injectable} from "@nestjs/common";
import {InjectConnection} from "@nestjs/typeorm/dist/common/typeorm.decorators";
import {GraphQLError} from "graphql";
import {Connection} from "typeorm";

import type {BaseModel} from "../../database/base-model";

type Class<T> = new (...args: unknown[]) => T;

@Injectable()
export class PopulateService<Entity extends BaseModel> {
    constructor(@InjectConnection()
      private readonly repo: Connection) {}

    async populateOneOrFail<RelationPath extends keyof Entity & string>(base: Class<Entity>, root: Entity, relation: RelationPath): Promise<Entity[RelationPath]> {
        const result: Entity[RelationPath] | undefined = await this.repo.createQueryBuilder()
            .relation(base, relation)
            .of(root)
            .loadOne();
        if (!result) throw new GraphQLError(`Unable to find ${relation} for ${base.name}`);
        return result;
    }

    async populateOne<RelationPath extends keyof Entity & string>(base: Class<Entity>, root: Entity, relation: RelationPath): Promise<Entity[RelationPath] | undefined> {
        const result: Entity[RelationPath] | undefined = await this.repo.createQueryBuilder()
            .relation(base, relation)
            .of(root)
            .loadOne();
        return result;
    }

    async populateMany<RelationPath extends keyof Entity & string>(base: Class<Entity>, root: Entity, relation: RelationPath): Promise<Entity[RelationPath]> {
        const result: Entity[RelationPath] = await this.repo.createQueryBuilder()
            .relation(base, relation)
            .of(root)
            .loadMany() as unknown as Entity[RelationPath];
        return result;
    }

}
