import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories";
import {Approval} from "./approval.model";

@Injectable()
export class ApprovalRepository extends ExtendedRepository<Approval> {
    constructor(readonly dataSource: DataSource) {
        super(Approval, dataSource);
    }
}
