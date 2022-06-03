import {forwardRef, Module} from "@nestjs/common";
import {EventsModule} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";

import {DatabaseModule} from "../database";
import {GameModule} from "../game";
import {IdentityModule} from "../identity";
import {MemberService} from "./member";
import {MemberResolver} from "./member/member.resolver";
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
        EventsModule,

    ],
    providers: [
        OrganizationResolver,
        OrganizationService,
        MemberService,
        {
            provide: "MEMBER_PUB_SUB",
            useValue: new PubSub(),
        },
        PronounsService,
        MemberPlatformAccountService,
        MemberRestrictionService,
        MemberRestrictionResolver,
        QueueBanGuard,
        MemberResolver,
    ],
    exports: [
        MemberService,
        MemberPlatformAccountService,
        MemberRestrictionService,
        QueueBanGuard,
    ],
})
export class OrganizationModule {}
