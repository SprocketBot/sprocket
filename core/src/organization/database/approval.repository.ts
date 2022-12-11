import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {Approval} from "./approval.entity";

@Injectable()
export class ApprovalRepository extends ExtendedRepository<Approval> {
    constructor(readonly dataSource: DataSource) {
        super(Approval, dataSource);
    }
}
