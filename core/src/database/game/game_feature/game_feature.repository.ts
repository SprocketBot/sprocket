import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {GameFeature} from "./game_feature.model";

@Injectable()
export class GameFeatureRepository extends ExtendedRepository<GameFeature> {
    constructor(readonly dataSource: DataSource) {
        super(GameFeature, dataSource);
    }
}
