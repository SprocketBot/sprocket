import {Module} from "@nestjs/common";
import {GqlModule} from "@sprocketbot/common";
import {EmbedModule} from "src/embed/embed.module";

import {MarshalModule} from "../marshal";
import {HelpMarshal} from "./help";
import {MemberLookupMarshal} from "./member-lookup.marshal";
import {OrganizationConfigurationMarshal} from "./organization-configuration.marshal";
import {UserRegistrationMarshal} from "./user-registration.marshal";

@Module({
    imports: [
        MarshalModule,
        GqlModule,
        EmbedModule,
    ],
    providers: [
        MemberLookupMarshal,
        UserRegistrationMarshal,
        OrganizationConfigurationMarshal,
        HelpMarshal,
    ],
})
export class MemberCommandsModule {}
