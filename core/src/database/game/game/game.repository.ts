import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {Game} from "./game.model";

@Injectable()
export class GameRepository extends ExtendedRepository<Game> {
    constructor(readonly dataSource: DataSource) {
        super(Game, dataSource);
    }
}
