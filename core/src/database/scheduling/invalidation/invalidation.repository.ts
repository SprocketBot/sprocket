import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {Invalidation} from "./invalidation.model";

@Injectable()
export class InvalidationRepository extends ExtendedRepository<Invalidation> {
    constructor(readonly dataSource: DataSource) {
        super(Invalidation, dataSource);
    }
}
