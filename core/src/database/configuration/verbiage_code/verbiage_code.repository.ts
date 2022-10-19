import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {VerbiageCode} from "./verbiage_code.model";

@Injectable()
export class VerbiageCodeRepository extends ExtendedRepository<VerbiageCode> {
    constructor(readonly dataSource: DataSource) {
        super(VerbiageCode, dataSource);
    }
}
