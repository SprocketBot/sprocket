import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {VerbiageCode} from "./verbiage-code.entity";

@Injectable()
export class VerbiageCodeRepository extends ExtendedRepository<VerbiageCode> {
    constructor(readonly dataSource: DataSource) {
        super(VerbiageCode, dataSource);
    }
}
