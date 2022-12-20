import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {GamePlatform} from "./game-platform.entity";

@Injectable()
export class GamePlatformRepository extends ExtendedRepository<GamePlatform> {
    constructor(readonly dataSource: DataSource) {
        super(GamePlatform, dataSource);
    }
}
