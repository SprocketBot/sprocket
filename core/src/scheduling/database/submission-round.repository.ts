import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {SubmissionRound} from "./submission-round.entity";

@Injectable()
export class SubmissionRoundRepository extends ExtendedRepository<SubmissionRound> {
    constructor(readonly dataSource: DataSource) {
        super(SubmissionRound, dataSource);
    }
}
