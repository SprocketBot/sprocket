import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {PlayerStatLine} from "./player_stat_line.model";

@Injectable()
export class PlayerStatLineRepository extends ExtendedRepository<PlayerStatLine> {
    constructor(readonly dataSource: DataSource) {
        super(PlayerStatLine, dataSource);
    }
}
