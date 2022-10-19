import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {Permission} from "./permissions.model";

@Injectable()
export class PermissionRepository extends ExtendedRepository<Permission> {
    constructor(readonly dataSource: DataSource) {
        super(Permission, dataSource);
    }
}
