import {Module} from "@nestjs/common";

import {OrganizationModule} from "./organization/organization.module";

@Module({
    imports: [OrganizationModule],
})
export class PublicModule {}
