import {Module} from "@nestjs/common";

import {DatabaseModule} from "../database";
import {GameModule} from "../game";
import {MemberService} from "./member";
import {MemberPlatformAccountService} from "./member-platform-account";
import {OrganizationResolver, OrganizationService} from "./organization";
import {PronounsService} from "./pronouns";

@Module({
    imports: [DatabaseModule, GameModule],
    providers: [
        OrganizationResolver,
        OrganizationService,
        MemberService,
        PronounsService,
        MemberPlatformAccountService,
    ],
})
export class OrganizationModule {}
