import {Module} from "@nestjs/common";

import {OrganizationDatabaseModule} from "../organization/database/organization-database.module";
import {AuthorizationService} from "./authorization.service";

@Module({
    imports: [OrganizationDatabaseModule],
    providers: [AuthorizationService],
})
export class AuthorizationModule {}
