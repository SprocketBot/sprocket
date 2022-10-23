import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {TeamStatLine} from "./team_stat_line.model";

@Injectable()
export class TeamStatLineRepository extends ExtendedRepository<TeamStatLine> {
    constructor(readonly dataSource: DataSource) {
        super(TeamStatLine, dataSource);
    }
}
