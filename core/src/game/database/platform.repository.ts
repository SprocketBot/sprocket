import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {Platform} from "./platform.entity";

@Injectable()
export class PlatformRepository extends ExtendedRepository<Platform> {
    constructor(readonly dataSource: DataSource) {
        super(Platform, dataSource);
    }
}
