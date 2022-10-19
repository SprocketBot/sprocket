import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {EligibilityData} from "./eligibility_data.model";

@Injectable()
export class EligibilityDataRepository extends ExtendedRepository<EligibilityData> {
    constructor(readonly dataSource: DataSource) {
        super(EligibilityData, dataSource);
    }
}
