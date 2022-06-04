import {Module} from "@nestjs/common";
import {CoreModule} from "@sprocketbot/common";

import {EmbedModule} from "../embed/embed.module";
import {MarshalModule} from "../marshal";
import {HelpMarshal} from "./help";
import {MemberLookupMarshal} from "./member-lookup.marshal";
import {OrganizationConfigurationMarshal} from "./organization-configuration.marshal";

@Module({
    imports: [
        MarshalModule,
        CoreModule,
        EmbedModule,
    ],
    providers: [
        MemberLookupMarshal,
        OrganizationConfigurationMarshal,
        HelpMarshal,
    ],
})
export class MemberCommandsModule {}
