import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {Action} from "./action.entity";

@Injectable()
export class ActionRepository extends ExtendedRepository<Action> {
    constructor(readonly dataSource: DataSource) {
        super(Action, dataSource);
    }
}
