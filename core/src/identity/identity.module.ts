import {Module} from "@nestjs/common";

import {OrganizationDatabaseModule} from "../organization/database/organization-database.module";
import {IdentityDatabaseModule} from "./database/identity-database.module";
import {UserController} from "./user/user.controller";
import {UserResolver} from "./user/user.resolver";

@Module({
    imports: [IdentityDatabaseModule, OrganizationDatabaseModule],
    controllers: [UserController],
    providers: [UserResolver],
})
export class IdentityModule {}
