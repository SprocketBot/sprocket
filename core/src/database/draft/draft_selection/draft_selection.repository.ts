import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {DraftSelection} from "./draft_selection.model";

@Injectable()
export class DraftSelectionRepository extends ExtendedRepository<DraftSelection> {
    constructor(readonly dataSource: DataSource) {
        super(DraftSelection, dataSource);
    }
}
