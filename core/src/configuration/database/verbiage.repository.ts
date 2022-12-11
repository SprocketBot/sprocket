import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {Verbiage} from "./verbiage.entity";

@Injectable()
export class VerbiageRepository extends ExtendedRepository<Verbiage> {
    constructor(readonly dataSource: DataSource) {
        super(Verbiage, dataSource);
    }
}
