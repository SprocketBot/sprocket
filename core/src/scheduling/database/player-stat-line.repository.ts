import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories/repository";
import {PlayerStatLine} from "./player-stat-line.entity";

@Injectable()
export class PlayerStatLineRepository extends ExtendedRepository<PlayerStatLine> {
    constructor(readonly dataSource: DataSource) {
        super(PlayerStatLine, dataSource);
    }
}
