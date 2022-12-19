import {Module} from "@nestjs/common";

import {ConfigurationModule} from "../configuration/configuration.module";
import {OrganizationDatabaseModule} from "./database/organization-database.module";
import {MemberController} from "./member/member.controller";
import {OrganizationController} from "./organization/organization.controller";

@Module({
    imports: [OrganizationDatabaseModule, ConfigurationModule],
    controllers: [MemberController, OrganizationController],
})
export class OrganizationModule {}
