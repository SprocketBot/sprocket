import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {ScrimMeta} from "./scrim_meta.model";

@Injectable()
export class ScrimMetaRepository extends ExtendedRepository<ScrimMeta> {
    constructor(readonly dataSource: DataSource) {
        super(ScrimMeta, dataSource);
    }
}
