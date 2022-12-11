import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {Pronouns} from "./pronouns.entity";

@Injectable()
export class PronounsRepository extends ExtendedRepository<Pronouns> {
    constructor(readonly dataSource: DataSource) {
        super(Pronouns, dataSource);
    }
}
