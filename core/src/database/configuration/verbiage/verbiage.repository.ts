import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {Verbiage} from "./verbiage.model";

@Injectable()
export class VerbiageRepository extends ExtendedRepository<Verbiage> {
    constructor(readonly dataSource: DataSource) {
        super(Verbiage, dataSource);
    }
}
