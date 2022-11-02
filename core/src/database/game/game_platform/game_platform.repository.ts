import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {GamePlatform} from "./game_platform.model";

@Injectable()
export class GamePlatformRepository extends ExtendedRepository<GamePlatform> {
    constructor(readonly dataSource: DataSource) {
        super(GamePlatform, dataSource);
    }
}
