import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories/repository";
import {Invalidation} from "./invalidation.entity";

@Injectable()
export class InvalidationRepository extends ExtendedRepository<Invalidation> {
    constructor(readonly dataSource: DataSource) {
        super(Invalidation, dataSource);
    }
}
