import {Module} from "@nestjs/common";

import {IdentityDatabaseModule} from "../identity/database/identity-database.module";
import {OrganizationDatabaseModule} from "../organization/database/organization-database.module";
import {AuthorizationService} from "./authorization.service";
import {AuthorizationDatabaseModule} from "./database/authorization-database.module";

@Module({
    imports: [AuthorizationDatabaseModule, IdentityDatabaseModule, OrganizationDatabaseModule],
    providers: [AuthorizationService],
    exports: [AuthorizationService],
})
export class AuthorizationModule {}
