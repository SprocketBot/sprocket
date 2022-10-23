import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {Action} from "./action.model";

@Injectable()
export class ActionRepository extends ExtendedRepository<Action> {
    constructor(readonly dataSource: DataSource) {
        super(Action, dataSource);
    }
}
