import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {DraftPick} from "./draft_pick.model";

@Injectable()
export class DraftPickRepository extends ExtendedRepository<DraftPick> {
    constructor(readonly dataSource: DataSource) {
        super(DraftPick, dataSource);
    }
}
