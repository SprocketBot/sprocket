import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {ScrimMeta} from "./scrim-meta.entity";

@Injectable()
export class ScrimMetaRepository extends ExtendedRepository<ScrimMeta> {
    constructor(readonly dataSource: DataSource) {
        super(ScrimMeta, dataSource);
    }
}
