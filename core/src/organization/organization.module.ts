import {forwardRef, Module} from "@nestjs/common";
import {EventsModule} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";

import {ConfigurationModule} from "../configuration";
import {DatabaseModule} from "../database";
import {FranchiseModule} from "../franchise";
import {GameModule} from "../game";
import {IdentityModule} from "../identity";
import {MemberPubSub} from "./constants";
import {
    MemberController, MemberResolver, MemberService,
} from "./member";
import {MemberPlatformAccountService} from "./member-platform-account";
import {
    MemberRestrictionResolver, MemberRestrictionService, QueueBanGuard,
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
        EventsModule,
        forwardRef(() => ConfigurationModule),
        forwardRef(() => FranchiseModule),
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
    controllers: [OrganizationController, MemberController],
})
export class OrganizationModule {}
