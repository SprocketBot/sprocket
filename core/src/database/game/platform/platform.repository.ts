import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {Platform} from "./platform.model";

@Injectable()
export class PlatformRepository extends ExtendedRepository<Platform> {
    constructor(readonly dataSource: DataSource) {
        super(Platform, dataSource);
    }
}
