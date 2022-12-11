import {Injectable} from "@nestjs/common";
import type {FindOneOptions} from "typeorm";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {Match} from "./match.entity";

@Injectable()
export class MatchRepository extends ExtendedRepository<Match> {
    constructor(readonly dataSource: DataSource) {
        super(Match, dataSource);
    }

    async getBySubmissionId(submissionId: string, options?: FindOneOptions<Match>): Promise<Match> {
        return this.findOneOrFail(Object.assign({where: {submissionId}}, options));
    }
}
