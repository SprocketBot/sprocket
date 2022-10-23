import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {GameMode} from "./game_mode.model";

@Injectable()
export class GameModeRepository extends ExtendedRepository<GameMode> {
    constructor(readonly dataSource: DataSource) {
        super(GameMode, dataSource);
    }
}
