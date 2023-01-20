import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {DraftSelection} from "./draft-selection.entity";

@Injectable()
export class DraftSelectionRepository extends ExtendedRepository<DraftSelection> {
    constructor(readonly dataSource: DataSource) {
        super(DraftSelection, dataSource);
    }
}
