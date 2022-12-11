import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {TeamStatLine} from "./team-stat-line.entity";

@Injectable()
export class TeamStatLineRepository extends ExtendedRepository<TeamStatLine> {
    constructor(readonly dataSource: DataSource) {
        super(TeamStatLine, dataSource);
    }
}
