import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {DraftPick} from "./draft-pick.entity";

@Injectable()
export class DraftPickRepository extends ExtendedRepository<DraftPick> {
    constructor(readonly dataSource: DataSource) {
        super(DraftPick, dataSource);
    }
}
