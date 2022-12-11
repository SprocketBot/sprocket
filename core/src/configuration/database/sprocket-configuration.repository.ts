import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {SprocketConfiguration} from "./sprocket-configuration.entity";

@Injectable()
export class SprocketConfigurationRepository extends ExtendedRepository<SprocketConfiguration> {
    constructor(readonly dataSource: DataSource) {
        super(SprocketConfiguration, dataSource);
    }
}
