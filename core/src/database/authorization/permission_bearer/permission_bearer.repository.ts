import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {PermissionBearer} from "./permission_bearer.model";

@Injectable()
export class PermissionBearerRepository extends ExtendedRepository<PermissionBearer> {
    constructor(readonly dataSource: DataSource) {
        super(PermissionBearer, dataSource);
    }
}
