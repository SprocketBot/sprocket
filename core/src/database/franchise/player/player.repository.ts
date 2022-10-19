import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {Player} from "./player.model";

@Injectable()
export class PlayerRepository extends ExtendedRepository<Player> {
    constructor(readonly dataSource: DataSource) {
        super(Player, dataSource);
    }
}
