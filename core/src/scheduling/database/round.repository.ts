import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {Round} from "./round.entity";

@Injectable()
export class RoundRepository extends ExtendedRepository<Round> {
    constructor(readonly dataSource: DataSource) {
        super(Round, dataSource);
    }
}
