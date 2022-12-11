import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {GameFeature} from "./game-feature.entity";

@Injectable()
export class GameFeatureRepository extends ExtendedRepository<GameFeature> {
    constructor(readonly dataSource: DataSource) {
        super(GameFeature, dataSource);
    }
}
