import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {EnabledFeature} from "./enabled_feature.model";

@Injectable()
export class EnabledFeatureRepository extends ExtendedRepository<EnabledFeature> {
    constructor(readonly dataSource: DataSource) {
        super(EnabledFeature, dataSource);
    }
}
