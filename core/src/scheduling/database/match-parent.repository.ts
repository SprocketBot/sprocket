import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories/repository";
import {MatchParent} from "./match-parent.entity";

@Injectable()
export class MatchParentRepository extends ExtendedRepository<MatchParent> {
    constructor(readonly dataSource: DataSource) {
        super(MatchParent, dataSource);
    }
}
