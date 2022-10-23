import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {Team} from "./team.model";

@Injectable()
export class TeamRepository extends ExtendedRepository<Team> {
    constructor(readonly dataSource: DataSource) {
        super(Team, dataSource);
    }
}
