import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {OrganizationMottos} from "./organization-mottos.entity";

@Injectable()
export class OrganizationMottosRepository extends ExtendedRepository<OrganizationMottos> {
    constructor(readonly dataSource: DataSource) {
        super(OrganizationMottos, dataSource);
    }
}
