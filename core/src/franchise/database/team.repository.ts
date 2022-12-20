import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {Team} from "./team.entity";

@Injectable()
export class TeamRepository extends ExtendedRepository<Team> {
    constructor(readonly dataSource: DataSource) {
        super(Team, dataSource);
    }
}
