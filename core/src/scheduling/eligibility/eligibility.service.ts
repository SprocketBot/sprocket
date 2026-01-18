import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { EligibilityData } from "$db/scheduling/eligibility_data/eligibility_data.model";

@Injectable()
export class EligibilityService {
    constructor(
        @InjectRepository(EligibilityData)
        private readonly eligibilityDataRepository: Repository<EligibilityData>,
    ) { }
}
