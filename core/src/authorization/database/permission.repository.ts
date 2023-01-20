import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {Permission} from "./permission.entity";

@Injectable()
export class PermissionRepository extends ExtendedRepository<Permission> {
    constructor(readonly dataSource: DataSource) {
        super(Permission, dataSource);
    }
}
