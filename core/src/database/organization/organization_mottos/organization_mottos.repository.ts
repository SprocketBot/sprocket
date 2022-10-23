import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories";
import {OrganizationMottos} from "./organization_mottos.model";

@Injectable()
export class OrganizationMottosRepository extends ExtendedRepository<OrganizationMottos> {
    constructor(readonly dataSource: DataSource) {
        super(OrganizationMottos, dataSource);
    }
}
