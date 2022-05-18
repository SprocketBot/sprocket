import {forwardRef, Module} from "@nestjs/common";

import {DatabaseModule} from "../database";
import {GameModule} from "../game";
import {IdentityModule} from "../identity";
import {MemberService} from "./member";
import {MemberPlatformAccountService} from "./member-platform-account";
import {
    MemberRestrictionResolver, MemberRestrictionService, QueueBanGuard,
} from "./member-restriction/";
import {OrganizationResolver, OrganizationService} from "./organization";
import {PronounsService} from "./pronouns/pronouns.service";

@Module({
    imports: [
        DatabaseModule,
        GameModule,
        forwardRef(() => IdentityModule),
    ],
    providers: [
        OrganizationResolver,
        OrganizationService,
        MemberService,
        PronounsService,
        MemberPlatformAccountService,
        MemberRestrictionService,
        MemberRestrictionResolver,
        QueueBanGuard,
    ],
    exports: [
        MemberService,
        MemberPlatformAccountService,
        MemberRestrictionService,
        QueueBanGuard,
    ],
})
export class OrganizationModule {}
