import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories";
import {Pronouns} from "./pronouns.model";

@Injectable()
export class PronounsRepository extends ExtendedRepository<Pronouns> {
    constructor(readonly dataSource: DataSource) {
        super(Pronouns, dataSource);
    }
}
