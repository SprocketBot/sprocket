import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {Feature} from "./feature.model";

@Injectable()
export class FeatureRepository extends ExtendedRepository<Feature> {
    constructor(readonly dataSource: DataSource) {
        super(Feature, dataSource);
    }
}
