import {Module} from "@nestjs/common";

import {DatabaseModule} from "../../database";
import {SprocketOrganizationResolver} from "./organization/organization.resolver";

@Module({
    imports: [DatabaseModule],
    providers: [SprocketOrganizationResolver],
})
export class OrganizationModule {}
