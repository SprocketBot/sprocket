import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {Round} from "./round.model";

@Injectable()
export class RoundRepository extends ExtendedRepository<Round> {
    constructor(readonly dataSource: DataSource) {
        super(Round, dataSource);
    }
}
