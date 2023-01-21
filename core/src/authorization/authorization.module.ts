import {Module} from "@nestjs/common";

import {OrganizationDatabaseModule} from "../organization/database/organization-database.module";
import {AuthorizationService} from "./authorization.service";
import {AuthorizationDatabaseModule} from "./database/authorization-database.module";

@Module({
    imports: [AuthorizationDatabaseModule, OrganizationDatabaseModule],
    providers: [AuthorizationService],
    exports: [AuthorizationService],
})
export class AuthorizationModule {}
