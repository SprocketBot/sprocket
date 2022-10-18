import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {SprocketConfiguration} from "./sprocket_configuration.model";

@Injectable()
export class SprocketConfigurationRepository extends ExtendedRepository<SprocketConfiguration> {
    constructor(readonly dataSource: DataSource) {
        super(SprocketConfiguration, dataSource);
    }
}
