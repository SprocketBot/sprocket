import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {EnabledFeature} from "./enabled-feature.entity";

@Injectable()
export class EnabledFeatureRepository extends ExtendedRepository<EnabledFeature> {
    constructor(readonly dataSource: DataSource) {
        super(EnabledFeature, dataSource);
    }
}
