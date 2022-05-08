import {Module} from "@nestjs/common";

import {DatabaseModule} from "../database";
import {GameModule} from "../game/game.module";
import {MemberService} from "./member/member.service";
import {MemberPlatformAccountService} from "./member-platform-account/member-platform-account.service";
import {
    MemberRestrictionResolver, MemberRestrictionService, QueueBanGuard,
} from "./member-restriction/";
import {OrganizationResolver} from "./organization/organization.resolver";
import {OrganizationService} from "./organization/organization.service";
import {PronounsService} from "./pronouns/pronouns.service";

@Module({
    imports: [DatabaseModule, GameModule],
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
    exports: [MemberService, MemberRestrictionService, QueueBanGuard],
})
export class OrganizationModule {}
