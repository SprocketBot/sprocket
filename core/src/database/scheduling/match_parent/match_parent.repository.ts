import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {MatchParent} from "./match_parent.model";

@Injectable()
export class MatchParentRepository extends ExtendedRepository<MatchParent> {
    constructor(readonly dataSource: DataSource) {
        super(MatchParent, dataSource);
    }
}
