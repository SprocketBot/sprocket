import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {PermissionBearer} from "./permission-bearer.entity";

@Injectable()
export class PermissionBearerRepository extends ExtendedRepository<PermissionBearer> {
    constructor(readonly dataSource: DataSource) {
        super(PermissionBearer, dataSource);
    }
}
