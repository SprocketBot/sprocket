import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {GameMode} from "./game-mode.entity";

@Injectable()
export class GameModeRepository extends ExtendedRepository<GameMode> {
    constructor(readonly dataSource: DataSource) {
        super(GameMode, dataSource);
    }
}
