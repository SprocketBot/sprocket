import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {EligibilityData} from "./eligibility-data.entity";

@Injectable()
export class EligibilityDataRepository extends ExtendedRepository<EligibilityData> {
    constructor(readonly dataSource: DataSource) {
        super(EligibilityData, dataSource);
    }
}
