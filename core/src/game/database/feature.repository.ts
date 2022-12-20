import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {Feature} from "./feature.entity";

@Injectable()
export class FeatureRepository extends ExtendedRepository<Feature> {
    constructor(readonly dataSource: DataSource) {
        super(Feature, dataSource);
    }
}
