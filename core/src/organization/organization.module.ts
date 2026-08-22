import {forwardRef, Module} from "@nestjs/common";
import {AnalyticsModule, EventsModule} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";

import {ConfigurationModule} from "../configuration";
import {DatabaseModule} from "../database";
import {FranchiseModule} from "../franchise";
import {GameModule} from "../game";
import {IdentityModule} from "../identity";
import {MledbInterfaceModule} from "../mledb";
import {UtilModule} from "../util/util.module";
import {MemberPubSub} from "./constants";
import {
    MemberController, MemberResolver, MemberService,
} from "./member";
import {MemberFixService} from "./member";
import {MemberModResolver} from "./member/member.mod.resolver";
import {MemberPlatformAccountService} from "./member-platform-account";
import {
    MemberRestrictionResolver,
    MemberRestrictionService,
    QueueBanGuard,
} from "./member-restriction/";
import {
    OrganizationController, OrganizationResolver, OrganizationService,
} from "./organization";
import {PronounsService} from "./pronouns/pronouns.service";

@Module({
    imports: [
        DatabaseModule,
        GameModule,
        forwardRef(() => IdentityModule),
        AnalyticsModule,
        EventsModule,
        forwardRef(() => ConfigurationModule),
        forwardRef(() => FranchiseModule),
        forwardRef(() => MledbInterfaceModule),
        UtilModule,
    ],
    providers: [
        OrganizationResolver,
        OrganizationService,
        MemberService,
        {
            provide: MemberPubSub,
            useValue: new PubSub(),
        },
        PronounsService,
        MemberFixService,
        MemberPlatformAccountService,
        MemberRestrictionService,
        MemberRestrictionResolver,
        QueueBanGuard,
        MemberResolver,
        MemberModResolver,
    ],
    exports: [
        MemberResolver,
        MemberService,
        MemberPlatformAccountService,
        MemberRestrictionService,
        QueueBanGuard,
        OrganizationService,
    ],
    controllers: [OrganizationController, MemberController],
})
export class OrganizationModule {}
