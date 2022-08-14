import {Injectable} from "@nestjs/common";
import type {DeepPartial} from "typeorm";
import {
    DataSource, EntityTarget, Repository,
} from "typeorm";

import type {BaseModel} from "./base-model";

@Injectable()
export abstract class BaseRepository<T extends BaseModel> extends Repository<T> {
    constructor(C: EntityTarget<T>, dataSource: DataSource) {
        super(C, dataSource.createEntityManager());
    }

    async createAndSave(data: DeepPartial<T>): Promise<T> {
        const newEntity = this.create(data);
        await this.save(newEntity);

        return newEntity;
    }
}
